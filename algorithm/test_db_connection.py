from utils.database_connector import DatabaseConnector
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_connection():
    """Test database connection"""
    try:
        logger.info("Testing database connection...")
        db = DatabaseConnector()
        connection = db._connect()
        
        if connection.is_connected():
            db_info = connection.get_server_info()
            logger.info(f"Connected to MySQL Server version {db_info}")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE();")
            database_name = cursor.fetchone()[0]
            logger.info(f"Connected to database: {database_name}")
            
            cursor.close()
            db._disconnect()
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_connection()
    if not success:
        exit(1)  # Return non-zero exit code on failure