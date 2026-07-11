FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file  
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of code
COPY . .

# EXPOSE 
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]