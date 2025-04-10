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
        self.port = int(os.environ.get('DB_PORT', 3306))
        self.connection = None
        
    def _connect(self):
        """Establish connection to the database"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port
            )
            logger.info(f"Connected to database {self.database} on {self.host}")
            return self.connection
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
        try:
            self._connect()
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
            self._disconnect()