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
    
    def get_connection(self):
        """Return the current database connection"""
        self._connect()  # Ensure the connection is active
        return self.connection
    
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
            service_types (str or List[str]): A comma-separated string or a list of service types (e.g., "venues, catering").
        Returns:
            List[Dict]: A list of services.
        """
        try:
            # Flatten nested lists, if any
            if isinstance(service_types, list):
                service_types = [item for sublist in service_types for item in sublist] if any(isinstance(i, list) for i in service_types) else service_types

                service_types_list = [st.strip().upper() for st in service_types]
            elif isinstance(service_types, str):
                service_types_list = [st.strip().upper() for st in service_types.split(",")]
            else:
                raise ValueError("`service_types` must be a string or a list of strings.")

            logger.info(f"Service types normalized: {service_types_list}")

            # Map service types to database table names
            TABLE_NAME_MAPPING = {
                "CATERING": "caterings",
                "PHOTOGRAPHER": "photographers",
                "VENUE": "venues",
                "DESIGNER": "designers",
            }

            # Fetch data from each valid service table
            all_services = []
            for service_type in service_types_list:
                table_name = TABLE_NAME_MAPPING.get(service_type)
                if not table_name:
                    raise ValueError(f"Invalid service type: {service_type}")

                # Fetch data from the appropriate table
                query = f"SELECT * FROM {table_name} WHERE status = 'APPROVED'"
                services = self.execute_query(query)
                logger.info(f"Fetched {len(services)} services for type '{service_type}' from table '{table_name}'")
                all_services.extend(services)

            return all_services

        except Exception as e:
            logger.error(f"Error fetching services for types '{service_types}': {e}")
            raise