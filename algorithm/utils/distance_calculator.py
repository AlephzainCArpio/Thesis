import re
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import logging
from typing import Tuple, Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

class GeocodingError(Exception):
    """Custom exception for geocoding errors"""
    pass

class DistanceCalculationError(Exception):
    """Custom exception for distance calculation errors"""
    pass

geolocator = Nominatim(user_agent="event_planning_app", timeout=10)

@lru_cache(maxsize=1000)
def get_coordinates(location: str) -> Optional[Tuple[float, float]]:
    try:
        if not location or not isinstance(location, str):
            raise ValueError("Invalid location string provided")

        location_data = geolocator.geocode(location)
        if location_data:
            coords = (location_data.latitude, location_data.longitude)
            logger.info(f"Successfully geocoded location: {location} -> {coords}")
            return coords
        
        coords = _parse_coordinates(location)
        if coords:
            logger.info(f"Parsed coordinates: {location} -> {coords}")
            return coords
        
        logger.warning(f"No geocoding results found for location: {location}")
        return None
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.error(f"Geocoding service error: {str(e)}")
        raise GeocodingError(f"Geocoding error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise GeocodingError(f"Unexpected error: {str(e)}")

def _parse_coordinates(location: str) -> Optional[Tuple[float, float]]:
    try:
        coords_match = re.search(r'(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)', location)
        if coords_match:
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
            if _validate_coordinates(lat, lng):
                return lat, lng
        return None
    except Exception as e:
        logger.error(f"Error parsing coordinates: {str(e)}")
        return None

def _validate_coordinates(lat: float, lng: float) -> bool:
    return -90 <= lat <= 90 and -180 <= lng <= 180

def calculate_distance(location1: str, location2: str) -> float:
    try:
        if not location1 or not location2:
            raise ValueError("Both locations must be provided")

        coords1 = get_coordinates(location1)
        coords2 = get_coordinates(location2)
        
        if not coords1 or not coords2:
            logger.warning(f"Could not geocode one or both locations: '{location1}', '{location2}'")
            return 1000.0  # Default high distance
        
        distance = geodesic(coords1, coords2).kilometers
        logger.info(f"Distance: {distance:.2f}km between {location1} and {location2}")
        return distance
    except GeocodingError as e:
        logger.error(f"Geocoding error: {str(e)}")
        raise DistanceCalculationError(f"Geocoding error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise DistanceCalculationError(f"Failed to calculate distance: {str(e)}")