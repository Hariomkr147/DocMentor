FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY . /app
RUN mkdir -p /app/data/uploads /app/data/vectorstores
EXPOSE 8000 8501
