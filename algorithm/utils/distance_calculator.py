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
geolocator = Nominatim(
    user_agent="event_planning_app",
    timeout=10
)

# Cache for geocoding results
geocode_cache = {}

def get_coordinates(location: str) -> Optional[Tuple[float, float]]:
    """
    Get latitude and longitude for a location string with proper error handling
    
    Args:
        location (str): Location string to geocode
        
    Returns:
        Optional[Tuple[float, float]]: Tuple of (latitude, longitude) or None if not found
        
    Raises:
        GeocodingError: If there's an error during geocoding
        ValueError: If the location string is invalid
    """
    try:
        if not location or not isinstance(location, str):
            raise ValueError("Invalid location string provided")

        # Check cache first
        if location in geocode_cache:
            logger.debug(f"Cache hit for location: {location}")
            return geocode_cache[location]
        
        # Try to geocode the location with retries
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Try to geocode the location
                location_data = geolocator.geocode(location)
                if location_data:
                    coords = (location_data.latitude, location_data.longitude)
                    geocode_cache[location] = coords
                    logger.info(f"Successfully geocoded location: {location}")
                    return coords
                
                # If no results found, try coordinate parsing
                coords = _parse_coordinates(location)
                if coords:
                    geocode_cache[location] = coords
                    return coords
                
                # If all attempts fail, return None
                logger.warning(f"No geocoding results found for location: {location}")
                return None
                
            except GeocoderTimedOut:
                if attempt == max_retries - 1:
                    raise GeocodingError(f"Geocoding timed out for location: {location}")
                logger.warning(f"Geocoding attempt {attempt + 1} timed out, retrying...")
                continue
                
            except GeocoderServiceError as e:
                raise GeocodingError(f"Geocoding service error: {str(e)}")
                
    except Exception as e:
        logger.error(f"Error processing location '{location}': {str(e)}")
        raise

def _parse_coordinates(location: str) -> Optional[Tuple[float, float]]:
    """
    Parse coordinates from a location string
    
    Args:
        location (str): Location string potentially containing coordinates
        
    Returns:
        Optional[Tuple[float, float]]: Parsed coordinates or None if parsing fails
    """
    try:
        # Try to extract coordinates from the location string
        coords_match = re.search(r'(\d+\.\d+)[,\s]+(\d+\.\d+)', location)
        if coords_match:
            lat = float(coords_match.group(1))
            lng = float(coords_match.group(2))
            
            # Validate coordinates
            if _validate_coordinates(lat, lng):
                return (lat, lng)
            else:
                logger.warning(f"Invalid coordinates found in string: {location}")
                return None
                
        return None
        
    except Exception as e:
        logger.error(f"Error parsing coordinates from '{location}': {str(e)}")
        return None

def _validate_coordinates(lat: float, lng: float) -> bool:
    """
    Validate that coordinates are within valid ranges
    
    Args:
        lat (float): Latitude to validate
        lng (float): Longitude to validate
        
    Returns:
        bool: True if coordinates are valid, False otherwise
    """
    return -90 <= lat <= 90 and -180 <= lng <= 180

def calculate_distance(location1: str, location2: str) -> float:
    """
    Calculate distance between two locations in kilometers with proper error handling
    
    Args:
        location1 (str): First location
        location2 (str): Second location
        
    Returns:
        float: Distance in kilometers
        
    Raises:
        DistanceCalculationError: If there's an error calculating the distance
        ValueError: If invalid locations are provided
    """
    try:
        if not location1 or not location2:
            raise ValueError("Both locations must be provided")

        # Get coordinates for both locations
        coords1 = get_coordinates(location1)
        coords2 = get_coordinates(location2)
        
        # If either location couldn't be geocoded, log warning and return default distance
        if not coords1 or not coords2:
            logger.warning(
                f"Could not calculate distance between {location1} and {location2}: "
                f"{'First' if not coords1 else 'Second'} location could not be geocoded"
            )
            return 1000
        
        # Calculate distance using geodesic
        try:
            distance = geodesic(coords1, coords2).kilometers
            logger.debug(f"Distance calculated: {distance:.2f}km between {location1} and {location2}")
            return distance
            
        except ValueError as e:
            raise DistanceCalculationError(f"Error calculating distance: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error in distance calculation: {str(e)}")
        raise DistanceCalculationError(f"Failed to calculate distance: {str(e)}")