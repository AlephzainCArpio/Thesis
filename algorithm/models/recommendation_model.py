import numpy as np
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from utils.distance_calculator import calculate_distance
from utils.database_connector import DatabaseConnector

class RecommendationModel:
    def __init__(self):
        self.db = DatabaseConnector()
    
    def get_recommendations(self, budget, location, guests, event_type, service_type, user_id=None):
        """
        Hybrid recommendation approach using Dijkstra's algorithm and KNN
        
        Args:
            budget (float): User's budget
            location (str): User's preferred location
            guests (int): Number of guests
            event_type (str): Type of event (wedding, corporate, etc.)
            service_type (str): Type of service (venue, catering, photographer, designer)
            user_id (str, optional): User ID for personalization
            
        Returns:
            list: List of recommended services
        """
        try:
            # Step 1: Get all available services of the requested type
            services = self.db.get_services(service_type)
            
            if not services:
                return []
            
            # Step 2: Use Dijkstra's algorithm to find the best option
            best_option = self._find_best_option(services, budget, location, guests, event_type)
            
            if not best_option:
                return []
            
            # Step 3: Use KNN to find two more similar options
            similar_options = self._find_similar_options(services, best_option, 2)
            
            # Step 4: Combine results and return
            recommendations = [best_option] + similar_options
            
            # Step 5: Check if user has viewed any of these services before
            if user_id:
                viewed_services = self.db.get_user_viewed_services(user_id, service_type)
                for rec in recommendations:
                    rec['previously_viewed'] = rec['id'] in viewed_services
            
            return recommendations
        
        except Exception as e:
            print(f"Error in recommendation model: {str(e)}")
            return []
    
    def _find_best_option(self, services, budget, location, guests, event_type):
        """
        Uses Dijkstra's algorithm to find the best option based on weighted criteria
        """
        best_score = float('-inf')
        best_option = None
        
        for service in services:
            # Skip services that don't match event type
            if event_type.lower() not in [et.lower() for et in service.get('eventTypes', [])]:
                continue
                
            # Skip venues that can't accommodate the number of guests
            if service.get('capacity', 0) < guests and 'capacity' in service:
                continue
                
            # Calculate distance score (inverse of distance)
            distance = calculate_distance(location, service.get('location', ''))
            distance_score = 1 / (1 + distance) if distance > 0 else 1
            
            # Calculate budget score (how close to budget without going over)
            price = service.get('price', 0)
            if price > budget:
                budget_score = 0  # Over budget
            else:
                budget_score = price / budget  # Higher score for options closer to budget
            
            # Calculate capacity score (for venues)
            capacity_score = 1.0
            if 'capacity' in service:
                # Ideal capacity is 20% more than guests
                ideal_capacity = guests * 1.2
                capacity_diff = abs(service.get('capacity', 0) - ideal_capacity)
                capacity_score = 1 / (1 + capacity_diff / guests)
            
            # Calculate final score with weights
            final_score = (
                0.4 * budget_score +
                0.4 * distance_score +
                0.2 * capacity_score
            )
            
            if final_score > best_score:
                best_score = final_score
                best_option = service
        
        return best_option
    
    def _find_similar_options(self, services, reference_service, k=2):
        """
        Uses KNN to find k services most similar to the reference service
        """
        if not reference_service or len(services) <= 1:
            return []
        
        # Extract features for comparison
        features = []
        service_ids = []
        
        for service in services:
            # Skip the reference service
            if service['id'] == reference_service['id']:
                continue
                
            # Extract relevant features
            feature_vector = [
                service.get('price', 0),
                calculate_distance(service.get('location', ''), reference_service.get('location', '')),
            ]
            
            # Add capacity if it exists
            if 'capacity' in service and 'capacity' in reference_service:
                feature_vector.append(service.get('capacity', 0))
            
            features.append(feature_vector)
            service_ids.append(service['id'])
        
        if not features:
            return []
        
        # Normalize features
        features = np.array(features)
        features_normalized = (features - features.min(axis=0)) / (features.max(axis=0) - features.min(axis=0) + 1e-10)
        
        # Find k nearest neighbors
        knn = NearestNeighbors(n_neighbors=min(k, len(features)), algorithm='auto')
        knn.fit(features_normalized)
        
        # Get reference service features
        ref_features = [
            reference_service.get('price', 0),
            0,  # Distance to itself is 0
        ]
        
        if 'capacity' in reference_service:
            ref_features.append(reference_service.get('capacity', 0))
        
        # Normalize reference features
        ref_features = np.array([ref_features])
        ref_normalized = (ref_features - features.min(axis=0)) / (features.max(axis=0) - features.min(axis=0) + 1e-10)
        
        # Get indices of nearest neighbors
        _, indices = knn.kneighbors(ref_normalized)
        
        # Return the similar services
        similar_services = []
        for idx in indices[0]:
            service_id = service_ids[idx]
            for service in services:
                if service['id'] == service_id:
                    similar_services.append(service)
                    break
        
        return similar_services
