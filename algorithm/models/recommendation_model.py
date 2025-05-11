import logging
import heapq
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from utils.database_connector import DatabaseConnector
from typing import List, Dict, Any
import hashlib

class RecommendationModel:
    def __init__(self, db_connector: DatabaseConnector, logger: logging.Logger, cache: dict):
        self.db = db_connector
        self.logger = logger
        self._cache = cache
        self.scaler = MinMaxScaler()

    def get_recommendations(self, budget: float, location: str, guests: int, event_type: str, service_types: List[str], user_id: str = None) -> Dict[str, List[Dict]]:
        user_input = {
            'budget': budget,
            'location': location,
            'guests': guests,
            'event_type': event_type,
            'service_types': service_types,
            'user_id': user_id
        }
        recommendations = self.recommend_services(user_input)
        self.logger.info(f"Final recommendations to be returned: {recommendations}")
        return recommendations

    def recommend_services(self, user_input: dict) -> Dict[str, List[Dict]]:
        self.logger.info(f"User input for recommendations: {user_input}")
        cache_key = self.generate_cache_key(user_input)
        if cache_key in self._cache:
            self.logger.info("Fetching recommendations from cache.")
            return self._cache[cache_key]

        services = self.db.get_services(user_input['service_types'])
        filtered_services = self._pre_filter_services(services, user_input)

        if not filtered_services:
            self.logger.warning("No matching services after pre-filtering.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        best_combination = self._dijkstra_optimal_combination(filtered_services, user_input['budget'], user_input['service_types'])
        similar_services = self._find_similar_services(filtered_services, best_combination, k=3)

        final_recommendations = {
            "best_match": best_combination,
            "above_budget": similar_services['above_budget'],
            "below_budget": similar_services['below_budget']
        }

        # Cache the final recommendations
        self._cache[cache_key] = final_recommendations
        self.logger.info("Recommendations generated and cached.")

        return final_recommendations

    def _pre_filter_services(self, services: List[Dict], user_input: dict) -> List[Dict]:
        """
        Filters services based on user input, including budget, guests, and event types.
        """
        filtered_services = []
        budget = user_input.get("budget", float('inf'))
        guests = user_input.get("guests", 0)
        event_type = user_input.get("event_type", "").lower()

        for service in services:
            try:
                # Calculate total cost based on service type
                if service['type'] == 'CATERING':
                    total_cost = service.get('pricePerPerson', 0) * guests
                elif service['type'] in ['DESIGNER', 'PHOTOGRAPHER']:
                    price_range = service.get('priceRange', '')
                    min_price, max_price = map(float, price_range.split('-')) if '-' in price_range else (float(price_range), float(price_range))
                    total_cost = (min_price + max_price) / 2
                else:  # VENUE
                    total_cost = service.get('price', float('inf'))

                # Skip services that exceed the budget
                if total_cost > budget:
                    continue

                # Filter by event types (if applicable)
                if service['type'] in ['VENUE', 'DESIGNER']:
                    service_event_types = service.get('eventTypes', "").lower().split(",") if service.get('eventTypes') else []
                    if event_type and event_type not in service_event_types:
                        continue

                # Validate capacity for VENUE and CATERING
                if service['type'] == 'VENUE' and guests > service.get('capacity', 0):
                    continue
                if service['type'] == 'CATERING' and guests > service.get('maxPeople', 0):
                    continue

                # Add the service to the filtered list
                filtered_services.append(service)

            except Exception as e:
                self.logger.warning(f"Skipping service due to error: {str(e)}")
                continue

        return filtered_services

    def generate_cache_key(self, user_input):
        """
        Generates a unique cache key based on user input.
        """
        key_string = f"{user_input['budget']}_{user_input['location']}_{user_input['guests']}_{user_input['event_type']}_{'_'.join(sorted(user_input['service_types']))}"
        return hashlib.md5(key_string.encode()).hexdigest()

    def _dijkstra_optimal_combination(self, services: List[Dict], budget: float, service_types: List[str]) -> List[Dict]:
        """
        Finds the optimal combination of services within the budget using a modified Dijkstra algorithm.
        """
        combinations = []
        priority_queue = []

        for service in services:
            heapq.heappush(priority_queue, (service['price'], [service]))

        while priority_queue:
            current_cost, current_combination = heapq.heappop(priority_queue)
            types_in_combination = {s['type'] for s in current_combination}
            if len(types_in_combination) == len(service_types):
                combinations.append((current_cost, current_combination))
                continue

            for service in services:
                if service['type'] not in types_in_combination:
                    new_cost = current_cost + service['price']
                    if new_cost <= budget:
                        heapq.heappush(priority_queue, (new_cost, current_combination + [service]))

        return min(combinations, key=lambda x: x[0])[1] if combinations else []

    def _find_similar_services(self, services: List[Dict], best_combination: List[Dict], k: int = 3) -> Dict[str, List[Dict]]:
        """
        Finds similar services above and below the budget using K-Nearest Neighbors.
        """
        similar = {"above_budget": [], "below_budget": []}
        features = [[s.get('price', 0), s.get('capacity', 0)] for s in services]
        features_normalized = self.scaler.fit_transform(features)

        knn = NearestNeighbors(n_neighbors=k, metric='euclidean')
        knn.fit(features_normalized)

        for service in best_combination:
            service_features = [[service.get('price', 0), service.get('capacity', 0)]]
            service_normalized = self.scaler.transform(service_features)
            distances, indices = knn.kneighbors(service_normalized)

            for idx in indices[0]:
                similar_service = services[idx]
                if similar_service['price'] > service['price']:
                    similar['above_budget'].append(similar_service)
                else:
                    similar['below_budget'].append(similar_service)

        return similar