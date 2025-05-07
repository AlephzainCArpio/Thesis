import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from utils.distance_calculator import DistanceCalculationError
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
            cache_key = f"{service_type}_{event_type}"
            if cache_key in self._cache:
                services = self._cache[cache_key]
            else:
                services = self.db.get_services(service_type)
                self._cache[cache_key] = services
            
            if not services:
                return {"best_match": [], "above_budget": [], "below_budget": []}
            
            filtered_services = self._pre_filter_services(services, budget, guests, event_type)
            if not filtered_services:
                return {"best_match": [], "above_budget": [], "below_budget": []}
            
            categorized_services = self._categorize_services(filtered_services, budget)
            for category in categorized_services:
                categorized_services[category] = self._post_process_recommendations(categorized_services[category], user_id)
            
            # Enhance with Dijkstra and KNN
            best_match = self._find_best_option_enhanced(categorized_services["best_match"], budget, location, guests, event_type)
            similar_options = self._find_similar_options_enhanced(filtered_services, best_match, k=2)
            
            # Update final categorized results
            categorized_services["best_match"] = [best_match] if best_match else []
            categorized_services["above_budget"] = similar_options if similar_options else []
            
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
        return [
            service for service in services
            if (service.get('price', float('inf')) <= budget * 1.2 and
                service.get('capacity', float('inf')) >= guests and
                event_type.lower() in [et.lower() for et in service.get('eventTypes', [])])
        ]
    
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
        pq = []  # Priority queue for best match
        for service in services:
            scores = {
                'price_score': self._calculate_price_score(service.get('price', 0), budget),
                'distance_score': self._calculate_distance_score(service.get('location', ''), location),
                'capacity_score': self._calculate_capacity_score(service.get('capacity', 0), guests),
                'event_type_score': 1 if event_type.lower() in [et.lower() for et in service.get('eventTypes', [])] else 0,
            }
            weights = {'price_score': 0.30, 'distance_score': 0.25, 'capacity_score': 0.20, 'event_type_score': 0.25}
            final_score = sum(score * weights[key] for key, score in scores.items())
            heapq.heappush(pq, (-final_score, service))
        return heapq.heappop(pq)[1] if pq else None
    
    def _find_similar_options_enhanced(self, services: List[Dict], reference_service: Dict, k: int = 2) -> List[Dict]:
        if not reference_service or len(services) <= 1:
            return []
        features = []
        service_ids = []
        feature_columns = ['price', 'capacity']
        for service in services:
            if service['id'] == reference_service['id']:
                continue
            feature_vector = [service.get(col, 0) for col in feature_columns]
            feature_vector.append(DistanceCalculationError(service.get('location', ''), reference_service.get('location', '')))
            features.append(feature_vector)
            service_ids.append(service['id'])
        if not features:
            return []
        features = np.array(features)
        features_normalized = self.scaler.fit_transform(features)
        knn = NearestNeighbors(n_neighbors=min(k, len(features)), algorithm='auto', metric='cosine')
        knn.fit(features_normalized)
        ref_features = [reference_service.get(col, 0) for col in feature_columns]
        ref_features.append(0)
        ref_normalized = self.scaler.transform([ref_features])
        _, indices = knn.kneighbors(ref_normalized)
        return [next((service for service in services if service['id'] == service_ids[idx]), None) for idx in indices[0]]
    
    def _calculate_price_score(self, price: float, budget: float) -> float:
        return 1 if price <= budget else 0