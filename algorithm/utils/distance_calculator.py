import re
from geopy.distance import geodesic
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
import logging
from typing import Tuple, Optional
from functools import lru_cache

# Configure logging
logger = logging.getLogger(__name__)

class GeocodingError(Exception):
    """Custom exception for geocoding errors"""
    pass

class DistanceCalculationError(Exception):
    """Custom exception for distance calculation errors"""
    pass

# Initialize geocoder with proper timeout and retries
geolocator = Nominatim(user_agent="event_planning_app", timeout=10)

@lru_cache(maxsize=1000)
def get_coordinates(location: str) -> Optional[Tuple[float, float]]:
    """
    Get latitude and longitude for a location string with proper error handling.
    
    Args:
        location (str): Location string to geocode.
        
    Returns:
        Optional[Tuple[float, float]]: Tuple of (latitude, longitude) or None if not found.
    """
    try:
        if not location or not isinstance(location, str):
            raise ValueError("Invalid location string provided")

        # Try to geocode the location
        location_data = geolocator.geocode(location)
        if location_data:
            coords = (location_data.latitude, location_data.longitude)
            logger.info(f"Successfully geocoded location: {location} -> {coords}")
            return coords
        
        # Try parsing if geocoding fails
        coords = _parse_coordinates(location)
        if coords:
            logger.info(f"Parsed coordinates from location string: {location} -> {coords}")
            return coords
        
        # If no results, log and return None
        logger.warning(f"No geocoding results found for location: {location}")
        return None
        
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.error(f"Geocoding service error for location '{location}': {str(e)}")
        raise GeocodingError(f"Geocoding error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error for location '{location}': {str(e)}")
        raise GeocodingError(f"Unexpected error: {str(e)}")

def _parse_coordinates(location: str) -> Optional[Tuple[float, float]]:
    """
    Parse coordinates from a location string.
    
    Args:
        location (str): Location string potentially containing coordinates.
        
    Returns:
        Optional[Tuple[float, float]]: Parsed coordinates or None if parsing fails.
    """
    try:
        coords_match = re.search(r'(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)', location)
        if coords_match:
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
            if _validate_coordinates(lat, lng):
                return lat, lng
            else:
                logger.warning(f"Invalid coordinates found in string: {location}")
        return None
    except Exception as e:
        logger.error(f"Error parsing coordinates from '{location}': {str(e)}")
        return None

def _validate_coordinates(lat: float, lng: float) -> bool:
    """
    Validate that coordinates are within valid ranges.
    
    Args:
        lat (float): Latitude to validate.
        lng (float): Longitude to validate.
        
    Returns:
        bool: True if coordinates are valid, False otherwise.
    """
    return -90 <= lat <= 90 and -180 <= lng <= 180

def calculate_distance(location1: str, location2: str) -> float:
    """
    Calculate distance between two locations in kilometers with proper error handling.
    
    Args:
        location1 (str): First location.
        location2 (str): Second location.
        
    Returns:
        float: Distance in kilometers.
    """
    try:
        if not location1 or not location2:
            raise ValueError("Both locations must be provided")

        # Get coordinates for both locations
        coords1 = get_coordinates(location1)
        coords2 = get_coordinates(location2)
        
        # If either location couldn't be geocoded, return a default high distance
        if not coords1 or not coords2:
            logger.warning(f"Could not geocode one or both locations: '{location1}', '{location2}'")
            return 1000.0  # Default high distance for failed geocoding
        
        # Calculate distance using geodesic
        distance = geodesic(coords1, coords2).kilometers
        logger.info(f"Distance calculated: {distance:.2f}km between {location1} and {location2}")
        return distance
        
    except GeocodingError as e:
        logger.error(f"Geocoding error during distance calculation: {str(e)}")
        raise DistanceCalculationError(f"Geocoding error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in distance calculation: {str(e)}")
        raise DistanceCalculationError(f"Failed to calculate distance: {str(e)}")
