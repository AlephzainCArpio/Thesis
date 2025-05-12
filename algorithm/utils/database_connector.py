import os
import mysql.connector
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class DatabaseConnector:
    def __init__(self):
        """Initialize database connector with credentials from environment variables"""
        self.host = os.environ.get('DB_HOST')
        self.user = os.environ.get('DB_USER')
        self.password = os.environ.get('DB_PASSWORD')
        self.database = os.environ.get('DB_NAME')
        self.port = int(os.environ.get('DB_PORT'))
        self.connection = None
        self._connect()  # Open connection when the object is created
        
    def _connect(self):
        """Establish connection to the database if not already connected"""
        if not self.connection or not self.connection.is_connected():
            try:
                self.connection = mysql.connector.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    port=self.port
                )
                logger.info(f"Connected to database {self.database} on {self.host}")
            except mysql.connector.Error as e:
                logger.error(f"Error connecting to MySQL database: {e}")
                raise
    
    def _disconnect(self):
        """Close the database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            logger.info("Database connection closed")
    
    def execute_query(self, query, params=None, fetch=True):
        """Execute a query and optionally fetch results"""
        cursor = None
        try:
            self._connect()  # Ensure connection is open before executing query
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute(query, params or ())

            if fetch:
                results = cursor.fetchall()
                return results
            else:
                self.connection.commit()
                return cursor.rowcount
        except Exception as e:
            logger.error(f"Query execution error: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
    
    def close(self):
        """Close the database connection explicitly when done"""
        self._disconnect()

    def get_services(self, service_types):
        """
        Fetch services from the database based on the service types.

        Args:
            service_types (List[str]): A list of service types (e.g., ["VENUE", "CATERING"]).

        Returns:
            List[Dict]: A list of services.
        """
        try:
            service_type_mapping = {
                "VENUE": "venues",
                "CATERING": "caterings",
                "PHOTOGRAPHER": "photographers",
                "DESIGNER": "designers"
            }

            all_services = []
            for service_type in service_types:
                table_name = service_type_mapping.get(service_type.upper())
                if not table_name:
                    continue

                query = f"SELECT * FROM {table_name} WHERE status = 'APPROVED'"
                services = self.execute_query(query)
                for service in services:
                    service['type'] = service_type.upper()
                all_services.extend(services)

            return all_services

        except Exception as e:
            logger.error(f"Error fetching services: {str(e)}")
            raise