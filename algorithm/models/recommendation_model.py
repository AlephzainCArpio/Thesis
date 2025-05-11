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

    def get_recommendations(self, budget: float, location: str, guests: int, event_type: str, service_type: List[str], user_id: str = None) -> Dict[str, List[Dict]]:
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
        service_types = user_input.get("service_type", [])
        all_services = self.db.get_services(service_types)

        self.logger.info(f"Fetched services from database: {all_services}")
        if not all_services:
            self.logger.warning("No services found for the given types.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        # Normalize and calculate similarity using kNN
        filtered_services = self._pre_filter_services(all_services, user_input)
        if not filtered_services:
            self.logger.warning("No matching services after pre-filtering.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        # Apply Dijkstra's Algorithm for optimal service combination
        best_combination = self._dijkstra_optimal_combination(filtered_services, user_input['budget'], service_types)
        if not best_combination:
            self.logger.warning("No feasible combinations found with Dijkstra's algorithm.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        # Use kNN to find similar services for each type in the best combination
        similar_services = self._find_similar_services(filtered_services, best_combination, k=3)

        return {
            "best_match": best_combination,
            "above_budget": similar_services['above_budget'],
            "below_budget": similar_services['below_budget']
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
                # Calculate total cost based on service type
                if service['type'] == 'CATERING':
                    total_cost = service.get('pricePerPerson', 0) * guests
                elif service['type'] in ['DESIGNER', 'PHOTOGRAPHER']:
                    price_range = service.get('priceRange', '')
                    if "-" in price_range:
                        min_price, max_price = map(float, price_range.split('-'))
                    else:
                        min_price, max_price = float(price_range), float(price_range)
                    total_cost = (min_price + max_price) / 2
                else:  # VENUE
                    total_cost = service.get('price', float('inf'))

                # Check if the cost fits within the allocated budget
                if total_cost > budget:
                    continue

                # Check for event type match
                if service['type'] in ['VENUE', 'DESIGNER']:
                    service_event_types = service.get('eventTypes', "").lower().split(",")
                    if event_type and event_type not in service_event_types:
                        continue

                # Ensure capacity is sufficient for the number of guests
                if service['type'] == 'VENUE' and guests > service.get('capacity', 0):
                    continue
                if service['type'] == 'CATERING' and guests > service.get('maxPeople', 0):
                    continue

                # Add service to the filtered list if it passes all criteria
                filtered_services.append(service)

            except Exception as e:
                self.logger.warning(f"Skipping service due to error: {str(e)}")
                continue

        return filtered_services

    def _dijkstra_optimal_combination(self, services: List[Dict], budget: float, service_types: List[str]) -> List[Dict]:
        """
        Uses Dijkstra's algorithm to find the optimal combination of services within the budget.
        """
        combinations = []
        priority_queue = []

        # Initialize the priority queue with each service
        for service in services:
            heapq.heappush(priority_queue, (service['price'], [service]))

        while priority_queue:
            current_cost, current_combination = heapq.heappop(priority_queue)

            # Check if the current combination matches all service types
            types_in_combination = {s['type'] for s in current_combination}
            if len(types_in_combination) == len(service_types):
                combinations.append((current_cost, current_combination))
                continue

            # Add neighbors (other services) to the priority queue
            for service in services:
                if service['type'] not in types_in_combination:
                    new_cost = current_cost + service['price']
                    if new_cost <= budget:
                        heapq.heappush(priority_queue, (new_cost, current_combination + [service]))

        # Return the combination with the lowest cost
        if combinations:
            return min(combinations, key=lambda x: x[0])[1]
        else:
            return []

    def _find_similar_services(self, services: List[Dict], best_combination: List[Dict], k: int = 3) -> Dict[str, List[Dict]]:
        """
        Uses kNN to find similar services for each type in the best combination.
        """
        similar = {
            "above_budget": [],
            "below_budget": []
        }

        features = [[service.get('price', 0), service.get('capacity', 0)] for service in services]
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