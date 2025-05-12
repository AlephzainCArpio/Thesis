import heapq
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict
import hashlib
class RecommendationModel:
    def __init__(self, db_connector, logger, cache):
        self.db = db_connector
        self.logger = logger
        self._cache = cache
        self.scaler = MinMaxScaler()

    def get_recommendations(self, budget, location, guests, event_type, service_types, user_id=None):
        user_input = {
            'budget': budget,
            'location': location,
            'guests': guests,
            'event_type': event_type,
            'service_types': service_types,
            'user_id': user_id
        }
        self.logger.info(f"User input for recommendations: {user_input}")
        recommendations = self.recommend_services(user_input)
        return recommendations

    def recommend_services(self, user_input):
        cache_key = self.generate_cache_key(user_input)
        if cache_key in self._cache:
            self.logger.info("Fetching recommendations from cache.")
            return self._cache[cache_key]

        services = self.db.get_services(user_input['service_types'])
        filtered_services = self._pre_filter_services(services, user_input)

        if not filtered_services:
            self.logger.warning("No matching services after pre-filtering.")
            return {"best_match": [], "above_budget": [], "below_budget": []}

        best_combination = self._dijkstra_optimal_combination(
            filtered_services, user_input['budget'], user_input['service_types']
        )
        similar_services = self._find_similar_services(
            filtered_services, best_combination, k=3
        )

        final_recommendations = {
            "best_match": best_combination,
            "above_budget": similar_services['above_budget'],
            "below_budget": similar_services['below_budget']
        }

        self._cache[cache_key] = final_recommendations
        self.logger.info("Recommendations generated and cached.")
        return final_recommendations

    def _pre_filter_services(self, services, user_input):
        filtered = []
        budget = user_input['budget']
        guests = user_input['guests']
        event_type = user_input['event_type'].lower()

        for service in services:
            try:
                total_cost = 0
                if service['type'] == 'VENUE':
                    total_cost = service['price']
                    if guests > service['capacity']:
                        continue
                    if event_type and event_type not in (service['eventTypes'] or "").lower().split(","):
                        continue
                elif service['type'] == 'CATERING':
                    total_cost = service['pricePerPerson'] * guests
                    if guests > service['maxPeople']:
                        continue
                elif service['type'] == 'PHOTOGRAPHER':
                    min_price, max_price = map(float, service['priceRange'].split('-'))
                    total_cost = (min_price + max_price) / 2
                elif service['type'] == 'DESIGNER':
                    min_price, max_price = map(float, service['priceRange'].split('-'))
                    total_cost = (min_price + max_price) / 2
                    if event_type and event_type not in (service['eventTypes'] or "").lower().split(","):
                        continue

                if total_cost > budget:
                    continue

                filtered.append(service)
            except Exception as e:
                self.logger.warning(f"Error processing service {service.get('id', 'unknown')}: {str(e)}")
                continue

        return filtered

    def _dijkstra_optimal_combination(self, services, budget, service_types):
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

    def _find_similar_services(self, services, best_combination, k=3):
        similar = {"above_budget": [], "below_budget": []}
        features = [[s['price'], s.get('capacity', 0)] for s in services]
        features_normalized = self.scaler.fit_transform(features)

        knn = NearestNeighbors(n_neighbors=k, metric='euclidean')
        knn.fit(features_normalized)

        for service in best_combination:
            service_features = [[service['price'], service.get('capacity', 0)]]
            service_normalized = self.scaler.transform(service_features)
            distances, indices = knn.kneighbors(service_normalized)

            for idx in indices[0]:
                similar_service = services[idx]
                if similar_service['price'] > service['price']:
                    similar['above_budget'].append(similar_service)
                else:
                    similar['below_budget'].append(similar_service)

        return similar

    def generate_cache_key(self, user_input):
        key_string = f"{user_input['budget']}_{user_input['location']}_{user_input['guests']}_{user_input['event_type']}_{'_'.join(sorted(user_input['service_types']))}"
        return hashlib.md5(key_string.encode()).hexdigest()