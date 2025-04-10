
# Algorithm Service Deployment Script

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if pip install was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies. Please check your requirements.txt file."
    exit 1
fi

# Test database connection
echo "Testing database connection..."
python test_db_connection.py

# Check if database connection test was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to connect to database. Please check your database configuration."
    exit 1
fi

# Start the service
echo "Starting algorithm service..."
python app.py