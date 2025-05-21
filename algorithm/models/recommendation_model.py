import logging
import heapq
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from utils.database_connector import DatabaseConnector
from typing import List, Dict, Any


class RecommendationModel:
    def __init__(self, db_connector: DatabaseConnector, logger: logging.Logger, cache: dict):
        self.db = db_connector
        self.logger = logger
        self._cache = cache
        self.scaler = MinMaxScaler()

    def get_recommendations(self, budget: float, guests: int, event_type: str, service_type: str, user_id: str = None) -> Dict[str, List[Dict]]:
        user_input = {
            'budget': budget,
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
        service_type = user_input.get("service_type", [])
        services = self.db.get_services([service_type])
        
        self.logger.info(f"Fetched services from database: {services}")
        if not services:
            self.logger.warning("No services found for the given type.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        filtered_services = self._pre_filter_services(services, user_input)
        self.logger.info(f"Filtered services: {filtered_services}")
        if not filtered_services:
            self.logger.warning("No matching services after pre-filtering.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        best_match = self._find_best_option_dijkstra(filtered_services, user_input)
        self.logger.info(f"Best match found: {best_match}")
        similar_options = self._find_similar_options_knn(filtered_services, best_match, k=2)

        return {
            "best_match": [best_match] if best_match else [],
            "above_budget": similar_options["above_budget"],
            "below_budget": similar_options["below_budget"]
        }

    def _pre_filter_services(self, services: List[Dict], user_input: dict) -> List[Dict]:
        filtered_services = []
        budget = user_input.get("budget", float('inf'))
        guests = user_input.get("guests", 0)
        event_type = user_input.get("event_type", "").lower()

        self.logger.info(f"Filtering services with budget: {budget}, guests: {guests}, event type: {event_type}")
        for service in services:
            try:
                if service['type'] == 'VENUE':
                    capacity = service.get('capacity', 0)
                    price = service.get('price', float('inf'))
                    if guests > capacity:
                        continue
                elif service['type'] == 'CATERING':
                    max_people = service.get('maxPeople', 0)
                    price_per_person = service.get('pricePerPerson', 0)
                    if guests > max_people:
                        continue
                    price = guests * price_per_person
                else:
                    price_range = service.get('priceRange', '0-0')
                    min_price, max_price = map(float, price_range.split('-'))
                    price = (min_price + max_price) / 2

                service_event_types = service.get('eventTypes', "").lower().split(",")
                if service.get("type") in ["VENUE", "DESIGNER"] and event_type and event_type not in service_event_types:
                    continue

                service['price'] = price
                filtered_services.append(service)

            except Exception as e:
                self.logger.warning(f"Skipping service due to error: {str(e)}")
                continue

        self.logger.info(f"Services after filtering: {len(filtered_services)}")
        return filtered_services

    def _find_best_option_dijkstra(self, services: List[Dict], user_input: dict) -> Dict:
        budget = user_input.get("budget", float('inf'))
        pq = []

        for service in services:
            try:
                price = service.get('price', float('inf'))
                score = abs(price - budget)
                heapq.heappush(pq, (score, service))
            except Exception as e:
                self.logger.error(f"Error processing service in Dijkstra's algorithm: {str(e)}")

        return heapq.heappop(pq)[1] if pq else None

    def _find_similar_options_knn(self, services: List[Dict], reference_service: Dict, k: int = 2) -> Dict[str, List[Dict]]:
        if not reference_service or len(services) <= 1:
            return {"above_budget": [], "below_budget": []}

        # Exclude the best match (reference_service) from the similar options
        filtered_services = [
            s for s in services
            if s != reference_service
        ]

        budget = reference_service.get('price', float('inf'))
        above_budget = []
        below_budget = []

        for service in filtered_services:
            price = service.get('price', 0)
            if price > budget:
                above_budget.append(service)
            else:
                below_budget.append(service)

        return {
            "above_budget": above_budget[:k],
            "below_budget": below_budget[:k]
        }