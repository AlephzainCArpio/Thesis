import logging
import heapq
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from utils.distance_calculator import calculate_distance, DistanceCalculationError
from utils.database_connector import DatabaseConnector
from typing import List, Dict, Any
import hashlib


class RecommendationModel:
    def __init__(self, db_connector: DatabaseConnector, logger: logging.Logger, cache: dict):
        self.db = db_connector
        self.logger = logger
        self._cache = cache
        self.scaler = MinMaxScaler()

    def get_recommendations(self, budget: float, location: str, guests: int, event_type: str, service_type: str, user_id: str = None) -> Dict[str, List[Dict]]:
        user_input = {
            'budget': budget,
            'location': location,
            'guests': guests,
            'event_type': event_type,
            'service_type': service_type,
            'user_id': user_id
        }
        recommendations = self.recommend_services(user_input)
        self.logger.info(f"Final recommendations to be returned: {recommendations}")
        return recommendations

    def recommend_services(self, user_input: dict) -> Dict[str, List[Dict]]:
        self.logger.info(f"User input for recommendations: {user_input}")
        service_type = user_input.get("service_type", "")
        services = self.db.get_services([service_type])

        self.logger.info(f"Fetched services from database: {services}")
        if not services:
            self.logger.warning("No services found for the given type.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        # Apply filtering based on user input
        filtered_services = self._pre_filter_services(services, user_input)
        self.logger.info(f"Filtered services: {filtered_services}")
        if not filtered_services:
            self.logger.warning("No matching services after pre-filtering.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        best_match = self._find_best_option_enhanced(filtered_services, user_input)
        self.logger.info(f"Best match found: {best_match}")
        similar_options = self._find_similar_options_enhanced(filtered_services, best_match, k=2)

        return {
            "best_match": [best_match] if best_match else [],
            "above_budget": similar_options,
            "below_budget": []
        }

    def _pre_filter_services(self, services: List[Dict], user_input: dict) -> List[Dict]:
        """
        Filters services based on user input such as budget, guests, and event type.
        Returns the services that meet the criteria.
        """
        filtered_services = []
        budget = user_input.get("budget", float('inf'))
        guests = user_input.get("guests", 0)
        event_type = user_input.get("event_type", "").lower()

        self.logger.info(f"Filtering services with budget: {budget}, guests: {guests}, event type: {event_type}")
        for service in services:
            try:
                price_range = service.get('priceRange', '')
                if "-" in price_range:
                    min_price, max_price = map(float, price_range.split('-'))
                else:
                    min_price, max_price = float(price_range), float(price_range)

                if not (min_price <= budget <= max_price):
                    continue  # Skip if the budget does not match the price range

                # Check for event type match
                service_event_types = service.get('eventTypes', "").lower().split(",")
                if event_type and event_type not in service_event_types:
                    continue

                # Ensure capacity is sufficient for the number of guests
                capacity = service.get('capacity', 0)
                if guests > capacity:
                    continue

                # Add service to the filtered list if it passes all criteria
                filtered_services.append(service)

            except Exception as e:
                self.logger.warning(f"Skipping service due to error: {str(e)}")
                continue

        self.logger.info(f"Services after filtering: {len(filtered_services)}")
        return filtered_services

    def _find_best_option_enhanced(self, services: List[Dict], user_input: dict) -> Dict:
        self.logger.info("Finding the best option using enhanced scoring...")

        pq = []
        budget = user_input.get("budget", float('inf'))
        location = user_input.get("location", "")
        guests = user_input.get("guests", 0)
        event_type = user_input.get("event_type", "").lower()

        for service in services:
            try:
                distance = calculate_distance(service.get('location', ''), location)
                distance_score = max(0, 1 - (distance / 100))  # Normalize distance score
                price = service.get('price', float('inf'))
                price_score = max(0, 1 - (price / budget))  # Normalize price score
                capacity_score = max(0, 1 - (guests / service.get('capacity', 1)))
                event_type_score = 1 if event_type in service.get('eventTypes', []) else 0

                final_score = 0.3 * price_score + 0.25 * distance_score + 0.2 * capacity_score + 0.25 * event_type_score
                heapq.heappush(pq, (-final_score, service))

            except DistanceCalculationError as e:
                self.logger.error(f"Distance calculation error: {str(e)}")

        return heapq.heappop(pq)[1] if pq else None

    def _find_similar_options_enhanced(self, services: List[Dict], reference_service: Dict, k: int = 2) -> List[Dict]:
        if not reference_service or len(services) <= 1:
            return []

        # Extract features (price and capacity) for comparison
        features = [[service.get('price', 0), service.get('capacity', 0)] for service in services if service['id'] != reference_service['id']]
        if not features:
            return []

        features_normalized = self.scaler.fit_transform(features)
        knn = NearestNeighbors(n_neighbors=min(k, len(features)), metric='cosine')
        knn.fit(features_normalized)
        ref_features = self.scaler.transform([[reference_service.get('price', 0), reference_service.get('capacity', 0)]])
        _, indices = knn.kneighbors(ref_features)

        return [services[idx] for idx in indices[0]]

    def generate_cache_key(self, user_input: dict) -> str:
        """
        Generates a cache key based on user input. It returns a hash string for unique identification.
        """
        hash_object = hashlib.md5(str(user_input).encode())
        return hash_object.hexdigest()