from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.database_connector import DatabaseConnector
from models.recommendation_model import RecommendationModel 
import os
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = RotatingFileHandler('app.log', maxBytes=10000000, backupCount=5)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
logger.addHandler(handler)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create database connector instance
db_connector = DatabaseConnector()

# Initialize the RecommendationModel with the required arguments
cache = {}  # Initialize an empty cache
recommendation_model = RecommendationModel(db_connector=db_connector, logger=logger, cache=cache)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint with proper error handling"""
    try:
        # Test database connection
        connection = db_connector.get_connection()
        if connection.is_connected():
            return jsonify({"status": "healthy", "database": "connected"})
        else:
            return jsonify({"status": "unhealthy", "database": "disconnected"}), 500
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "database": "error",
            "error": str(e)
        }), 500
    finally:
        # Ensure connection is properly closed
        try:
            if 'connection' in locals() and connection.is_connected():
                connection.close()
                logger.info("Database connection closed")
        except Exception as e:
            logger.error(f"Error closing database connection: {str(e)}")

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    return jsonify({
        "error": "Not Found",
        "message": "The requested resource was not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        "error": "Internal Server Error",
        "message": "An unexpected error occurred"
    }), 500

@app.route('/recommendation', methods=['POST'])
def get_recommendations():
    """Endpoint for getting recommendations with proper error handling"""
    try:
        # Validate request data
        data = request.get_json()
        logger.info(f"Received recommendation request with data: {data}")
        
        if not data:
            return jsonify({
                "error": "Bad Request",
                "message": "No data provided"
            }), 400

        required_fields = ['budget', 'location', 'guests', 'eventType', 'serviceType']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            return jsonify({
                "error": "Bad Request",
                "message": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Validate serviceType field
        if not isinstance(data['serviceType'], list) or not data['serviceType']:
            return jsonify({
                "error": "Bad Request",
                "message": "'serviceType' must be a non-empty list"
            }), 400

        # Map eventType to eventTypes for database compatibility
        event_types = [data['eventType']]  # Convert to list if needed

        # Process the recommendation request using RecommendationModel
        recommendations = recommendation_model.get_recommendations(
            budget=data['budget'],
            location=data['location'],
            guests=data['guests'],
            event_type=event_types,  # Pass as a list
            service_types=data['serviceType'],  # Ensure plural form is used
            user_id=data.get('userId')
        )

        if not recommendations:
            logger.warning("No recommendations found for the given input.")
            return jsonify({
                "message": "No recommendations found"
            }), 404

        logger.info("Recommendations successfully generated.")
        return jsonify({"recommendations": recommendations})

    except ValueError as e:
        logger.error(f"Value error in recommendations: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Bad Request",
            "message": str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error processing recommendations: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal Server Error",
            "message": "An error occurred while processing recommendations"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv("PORT"))
    debug = bool(int(os.getenv("FLASK_DEBUG", "0")))
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    except Exception as e:
        logger.critical(f"Failed to start server: {str(e)}")
        raise