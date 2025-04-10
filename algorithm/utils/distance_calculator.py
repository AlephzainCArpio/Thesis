import math
import re
from geopy.distance import geodesic
from geopy.geocoders import Nominatim

# Initialize geocoder
geolocator = Nominatim(user_agent="event_planning_app")

# Cache for geocoding results to avoid repeated API calls
geocode_cache = {}

def get_coordinates(location):
    """
    Get latitude and longitude for a location string
    """
    if location in geocode_cache:
        return geocode_cache[location]
    
    try:
        # Try to geocode the location
        location_data = geolocator.geocode(location)
        if location_data:
            coords = (location_data.latitude, location_data.longitude)
            geocode_cache[location] = coords
            return coords
    except Exception as e:
        print(f"Error geocoding location '{location}': {str(e)}")
    
    # If geocoding fails, try to extract coordinates from the location string
    # This is a backup for testing when geocoding API might be unavailable
    coords_match = re.search(r'(\d+\.\d+)[,\s]+(\d+\.\d+)', location)
    if coords_match:
        lat = float(coords_match.group(1))
        lng = float(coords_match.group(2))
        coords = (lat, lng)
        geocode_cache[location] = coords
        return coords
    
    # Return None if location can't be geocoded
    return None

def calculate_distance(location1, location2):
    """
    Calculate distance between two locations in kilometers
    """
    # Get coordinates for both locations
    coords1 = get_coordinates(location1)
    coords2 = get_coordinates(location2)
    
    # If either location couldn't be geocoded, return a large distance
    if not coords1 or not coords2:
        return 1000  # Default large distance
    
    # Calculate distance using geodesic
    distance = geodesic(coords1, coords2).kilometers
    
    return distance
