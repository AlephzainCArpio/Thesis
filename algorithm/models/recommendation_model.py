import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from utils.distance_calculator import DistanceCalculationError
from utils.database_connector import DatabaseConnector
from typing import List, Dict, Any
import heapq

class RecommendationModel:
    def __init__(self):
        self.db = DatabaseConnector()
        self.scaler = MinMaxScaler()
        # Add cache for frequently accessed data
        self._cache = {}
        
    def get_recommendations(self, budget: float, location: str, 
                          guests: int, event_type: str, 
                          service_type: str, user_id: str = None) -> List[Dict[Any, Any]]:
        """
        Enhanced hybrid recommendation approach
        """
        try:
            # Step 1: Get services with caching
            cache_key = f"{service_type}_{event_type}"
            if cache_key in self._cache:
                services = self._cache[cache_key]
            else:
                services = self.db.get_services(service_type)
                self._cache[cache_key] = services
            
            if not services:
                return []
            
            # Step 2: Pre-filter services
            filtered_services = self._pre_filter_services(
                services, budget, guests, event_type
            )
            
            if not filtered_services:
                return []
            
            # Step 3: Find best option using enhanced Dijkstra
            best_option = self._find_best_option_enhanced(
                filtered_services, budget, location, guests, event_type
            )
            
            if not best_option:
                return []
            
            # Step 4: Use enhanced KNN for similar options
            similar_options = self._find_similar_options_enhanced(
                filtered_services, best_option, k=2
            )
            
            # Step 5: Post-process recommendations
            recommendations = self._post_process_recommendations(
                [best_option] + similar_options, user_id
            )
            
            return recommendations
            
        except Exception as e:
            print(f"Error in recommendation model: {str(e)}")
            return []
    
    def _pre_filter_services(self, services: List[Dict], 
                           budget: float, guests: int, 
                           event_type: str) -> List[Dict]:
        """
        Pre-filter services to reduce computation load
        """
        return [
            service for service in services
            if (service.get('price', float('inf')) <= budget * 1.1 and  # Allow 10% budget flexibility
                service.get('capacity', float('inf')) >= guests and
                event_type.lower() in [et.lower() for et in service.get('eventTypes', [])])  # Event type filter
        ]
    
    def _find_best_option_enhanced(self, services: List[Dict], 
                                 budget: float, location: str, 
                                 guests: int, event_type: str) -> Dict:
        """
        Enhanced Dijkstra's algorithm with priority queue and weighted criteria
        """
        pq = []  # Priority queue
        
        for service in services:
            # Calculate comprehensive score
            scores = {
                'price_score': self._calculate_price_score(service.get('price', 0), budget),
                'distance_score': self._calculate_distance_score(service.get('location', ''), location),
                'capacity_score': self._calculate_capacity_score(service.get('capacity', 0), guests),
                'event_type_score': 1 if event_type.lower() in [et.lower() for et in service.get('eventTypes', [])] else 0,  # Event type score
            }
            
            # Calculate weighted final score
            weights = {
                'price_score': 0.30,
                'distance_score': 0.25,
                'capacity_score': 0.20,
                'event_type_score': 0.25,  # Assign weight to event type match
            }
            
            final_score = sum(score * weights[key] for key, score in scores.items())
            
            # Add to priority queue (negative score for max-heap)
            heapq.heappush(pq, (-final_score, service))
        
        return heapq.heappop(pq)[1] if pq else None
    
    def _find_similar_options_enhanced(self, services: List[Dict], 
                                     reference_service: Dict, 
                                     k: int = 2) -> List[Dict]:
        """
        Enhanced KNN with dynamic feature weighting
        """
        if not reference_service or len(services) <= 1:
            return []
        
        # Extract and normalize features
        features = []
        service_ids = []
        
        feature_columns = [
            'price', 'capacity'
        ]
        
        for service in services:
            if service['id'] == reference_service['id']:
                continue
                
            feature_vector = [
                service.get(col, 0) for col in feature_columns
            ]
            
            # Add location distance as a feature
            feature_vector.append(
                DistanceCalculationError(
                    service.get('location', ''), 
                    reference_service.get('location', '')
                )
            )
            
            features.append(feature_vector)
            service_ids.append(service['id'])
        
        if not features:
            return []
        
        # Normalize features
        features = np.array(features)
        features_normalized = self.scaler.fit_transform(features)
        
        # Use cosine similarity metric for KNN
        knn = NearestNeighbors(
            n_neighbors=min(k, len(features)),
            algorithm='auto',
            metric='cosine'
        )
        knn.fit(features_normalized)
        
        # Get reference service features
        ref_features = [
            reference_service.get(col, 0) for col in feature_columns
        ]
        ref_features.append(0)  # Distance to itself is 0
        
        # Normalize reference features
        ref_normalized = self.scaler.transform([ref_features])
        
        # Find nearest neighbors
        _, indices = knn.kneighbors(ref_normalized)
        
        # Return similar services
        return [
            next((service for service in services 
                  if service['id'] == service_ids[idx]), None)
            for idx in indices[0]
        ]
    
    def _post_process_recommendations(self, recommendations: List[Dict], 
                                   user_id: str = None) -> List[Dict]:
        """
        Post-process recommendations with additional context
        """
        if not user_id:
            return recommendations
            
        # Get user preferences and history
        user_history = self.db.get_user_viewed_services(user_id)
       
        for rec in recommendations:
            # Mark previously viewed services
            rec['previously_viewed'] = rec['id'] in user_history
            
            # Add availability status
            rec['availability'] = self._check_availability(rec)
        
        return recommendations
    
    # Helper methods for scoring
    def _calculate_price_score(self, price: float, budget: float) -> float:
        if price > budget:
            return 0
        return 1 - (price / budget)
    
    def _calculate_distance_score(self, service_location: str, 
                                user_location: str) -> float:
        distance = DistanceCalculationError(service_location, user_location)
        return 1 / (1 + distance)
    
    def _calculate_capacity_score(self, capacity: int, 
                                required_capacity: int) -> float:
        if capacity < required_capacity:
            return 0
        # Prefer venues with capacity 20-50% more than required
        ideal_capacity = required_capacity * 1.35
        diff_ratio = abs(capacity - ideal_capacity) / required_capacity
        return 1 / (1 + diff_ratio)
    
    def _calculate_rating_score(self, rating: float) -> float:
        return rating / 5.0 if rating else 0
    
    def _calculate_popularity_score(self, bookings_count: int) -> float:
        return min(bookings_count / 1000, 1.0)
    
    def _calculate_preference_match(self, service: Dict, 
                                  preferences: Dict) -> float:
        """Calculate how well service matches user preferences"""
        if not preferences:
            return 0.5
        
        match_scores = []
        for pref, value in preferences.items():
            if pref in service:
                if isinstance(value, (int, float)):
                    # Numeric preference
                    diff = abs(service[pref] - value) / max(value, 1)
                    match_scores.append(1 - min(diff, 1))
                else:
                    # Categorical preference
                    match_scores.append(1.0 if service[pref] == value else 0.0)
        
        return sum(match_scores) / len(match_scores) if match_scores else 0.5
