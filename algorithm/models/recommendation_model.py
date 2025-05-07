import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from utils.distance_calculator import calculate_distance, DistanceCalculationError
from utils.database_connector import DatabaseConnector
from typing import List, Dict, Any
import heapq
import logging

class RecommendationModel:
    def __init__(self):
        self.db = DatabaseConnector()
        self.scaler = MinMaxScaler()
        self._cache = {}
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)
        
    def get_recommendations(self, budget: float, location: str, guests: int, event_type: str, service_type: str, user_id: str = None) -> Dict[str, List[Dict[Any, Any]]]:
        try:
            self.logger.info(f"Inputs - Budget: {budget}, Location: {location}, Guests: {guests}, Event Type: {event_type}, Service Type: {service_type}")

            # Step 1: Get Services (with caching)
            cache_key = f"{service_type}_{event_type}"
            services = self._cache.get(cache_key) or self.db.get_services(service_type)
            self._cache[cache_key] = services

            if not services:
                self.logger.warning("No services found for the given type.")
                return {"best_match": [], "above_budget": [], "below_budget": []}
            
            # Step 2: Pre-filter Services
            filtered_services = self._pre_filter_services(services, budget, guests, event_type)
            if not filtered_services:
                self.logger.warning("No matching services after pre-filtering.")
                return {"best_match": [], "above_budget": [], "below_budget": []}
            
            # Step 3: Categorize Services
            categorized_services = self._categorize_services(filtered_services, budget)
            for category in categorized_services:
                categorized_services[category] = self._post_process_recommendations(categorized_services[category], user_id)
            
            # Step 4: Find Best Option
            best_match = self._find_best_option_enhanced(categorized_services["best_match"], budget, location, guests, event_type)
            similar_options = self._find_similar_options_enhanced(filtered_services, best_match, k=2)
            
            # Step 5: Update Categorized Results
            categorized_services["best_match"] = [best_match] if best_match else []
            categorized_services["above_budget"] = similar_options if similar_options else []

            self.logger.info(f"Final categorized services: {categorized_services}")
            return categorized_services
            
        except Exception as e:
            self.logger.error(f"Error in recommendation model: {str(e)}")
            return {"best_match": [], "above_budget": [], "below_budget": []}

    def _categorize_services(self, services: List[Dict], budget: float) -> Dict[str, List[Dict]]:
        best_match = []
        above_budget = []
        below_budget = []
        flexibility = 1.2  # Configurable flexibility for above budget
        for service in services:
            price = service.get('price', float('inf'))
            if price <= budget:
                best_match.append(service)
            elif budget < price <= budget * flexibility:
                above_budget.append(service)
            else:
                below_budget.append(service)
        return {"best_match": best_match, "above_budget": above_budget, "below_budget": below_budget}

    def _pre_filter_services(self, services: List[Dict], budget: float, guests: int, event_type: str) -> List[Dict]:
        filtered = []
        for service in services:
            price = service.get('price', float('inf'))
            capacity = service.get('capacity', float('inf'))
            event_types = service.get('eventTypes', [])

            # Log the conditions being checked
            self.logger.info(f"Checking service: {service.get('name', 'Unnamed')}")
            self.logger.info(f"Price: {price}, Capacity: {capacity}, Event Types: {event_types}, Budget: {budget}, Guests: {guests}, Event Type: {event_type}")
            
            # Handle missing or 'inf' values
            if price == float('inf') or capacity == float('inf'):
                self.logger.info(f"Service {service.get('name', 'Unnamed')} has incomplete data (price or capacity is 'inf').")
                continue  # Skip services with 'inf' values

            # Apply filtering conditions
            if (price <= budget * 1.2 and
                capacity >= guests and
                (not event_type or event_type.lower() in [et.lower() for et in event_types])):
                filtered.append(service)
            else:
                # Log why the service was excluded
                self.logger.info(f"Excluded service: {service.get('name', 'Unnamed')} due to filtering conditions.")
    
        return filtered
    
    def _post_process_recommendations(self, recommendations: List[Dict], user_id: str = None) -> List[Dict]:
        if not user_id:
            return recommendations
        user_history = self.db.get_user_viewed_services(user_id)
        for rec in recommendations:
            rec['previously_viewed'] = rec['id'] in user_history
            rec['availability'] = self._check_availability(rec)
        return recommendations

    def _check_availability(self, service: Dict) -> bool:
        return self.db.is_service_available(service['id'])
    
    def _find_best_option_enhanced(self, services: List[Dict], budget: float, location: str, guests: int, event_type: str) -> Dict:
        self.logger.info("Finding the best option based on scores...")
        pq = []  # Priority queue for best match
        for service in services:
            try:
                # Calculate distance score (closer is better)
                distance = calculate_distance(service.get('location', ''), location)
                distance_score = max(0, 1 - (distance / 100))  # Adjusted for realistic distance scaling

                # Calculate other scores
                scores = {
                    'price_score': self._calculate_price_score(service.get('price', 0), budget),
                    'distance_score': distance_score,
                    'capacity_score': self._calculate_capacity_score(service.get('capacity', 0), guests),
                    'event_type_score': 1 if event_type.lower() in [et.lower() for et in service.get('eventTypes', [])] else 0,
                }

                # Weights for each score component
                weights = {
                    'price_score': 0.30,
                    'distance_score': 0.25,
                    'capacity_score': 0.20,
                    'event_type_score': 0.25,
                }

                # Calculate final score
                final_score = sum(score * weights[key] for key, score in scores.items())
                heapq.heappush(pq, (-final_score, service))

            except DistanceCalculationError as e:
                self.logger.error(f"Distance calculation error for service '{service.get('name', 'unknown')}': {str(e)}")
                continue

        return heapq.heappop(pq)[1] if pq else None
    
    def _find_similar_options_enhanced(self, services: List[Dict], reference_service: Dict, k: int = 2) -> List[Dict]:
        if not reference_service or len(services) <= 1:
            return []
        features = [[service.get('price', 0), service.get('capacity', 0)] for service in services if service['id'] != reference_service['id']]
        service_ids = [service['id'] for service in services if service['id'] != reference_service['id']]
        if not features:
            return []
        features_normalized = self.scaler.fit_transform(features)
        knn = NearestNeighbors(n_neighbors=min(k, len(features)), algorithm='auto', metric='cosine')
        knn.fit(features_normalized)
        ref_features = self.scaler.transform([[reference_service.get('price', 0), reference_service.get('capacity', 0)]])
        _, indices = knn.kneighbors(ref_features)
        return [next((service for service in services if service['id'] == service_ids[idx]), None) for idx in indices[0]]
