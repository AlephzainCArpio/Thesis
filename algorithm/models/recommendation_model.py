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
        Enhanced weighted scoring for Dijkstra's algorithm
        """
        best_score = float('-inf')
        best_option = None
        
        # Define dynamic weights based on event type
        weights = {
            'wedding': {
                'distance': 0.30,
                'budget': 0.35,
                'capacity': 0.25,
            },
            'birthday': {
                'distance': 0.25,
                'budget': 0.40,
                'capacity': 0.30,
            },
            'corporate': {
                'distance': 0.30,
                'budget': 0.40,
                'capacity': 0.20,
            },
            'reunion': {
                'distance': 0.25,
                'budget': 0.30,
                'capacity': 0.35,
            },
            'social': {
                'distance': 0.35,
                'budget': 0.30,
                'capacity': 0.30,
            }
        }
        
        event_weights = weights.get(event_type.lower(), weights['wedding'])
        
        for service in services:
            if not self._meets_basic_criteria(service, event_type, guests):
                continue
                
            scores = {
                'distance': self._calculate_distance_score(location, service),
                'budget': self._calculate_budget_score(budget, service),
                'capacity': self._calculate_capacity_score(guests, service)
            }
            
            # Calculate weighted final score
            final_score = sum(scores[metric] * event_weights[metric] 
                             for metric in scores.keys())
            
            if final_score > best_score:
                best_score = final_score
                best_option = service
                
        return best_option

    
    def _find_similar_options(self, services, best_option, n_neighbors=2):
        """
        Enhanced KNN implementation with multiple features
        """
        # Convert services to feature matrix
        features = []
        for service in services:
            feature_vector = [
                service.get('price', 0) / best_option['price'],  # Price ratio
                service.get('capacity', 0) / best_option['capacity'],  # Capacity ratio
            ]
            features.append(feature_vector)
        
        # Initialize KNN with cosine similarity
        knn = NearestNeighbors(
            n_neighbors=n_neighbors + 1,  # +1 because best_option will be included
            metric='cosine',
            algorithm='brute'
        )
        
        # Fit and find neighbors
        knn.fit(features)
        _, indices = knn.kneighbors([features[services.index(best_option)]])
        
        # Return similar services (excluding the best_option itself)
        similar_services = [
            services[idx] for idx in indices[0][1:]  # Skip first result (best_option)
        ]
        
        return similar_services
