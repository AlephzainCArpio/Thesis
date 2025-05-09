set -e

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip to avoid dependency issues
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
if ! pip install -r requirements.txt; then
    echo "Error: Failed to install dependencies. Please check your requirements.txt file."
    exit 1
fi

# Test database connection
echo "Testing database connection..."
if ! python test_db_connection.py; then
    echo "Error: Failed to connect to the database. Please check your database configuration."
    exit 1
fi

# Start the service
echo "Starting algorithm service..."
if ! python app.py; then
    echo "Error: Failed to start the algorithm service."
    exit 1
fi

echo "Algorithm service started successfully."