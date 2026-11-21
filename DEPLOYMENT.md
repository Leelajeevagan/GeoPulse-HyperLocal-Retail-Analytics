# GeoPulse – Production Deployment Guide

This guide details the steps to deploy the **GeoPulse Retail Spatial Intelligence Platform** to enterprise cloud environments (AWS, GCP, Azure, or Linux VPS).

---

## 🏗️ 1. Architecture Overview

GeoPulse runs as a decoupled full-stack architecture:
* **Frontend**: React 18 + Vite SPA served via high-performance Nginx Alpine container.
* **Backend**: FastAPI (Python 3.11+) ASGI application running with Uvicorn.
* **Database**: SQLite (default local) or PostgreSQL (production recommendation).
* **Storage**: Local filesystem `/app/exports` mounted volume or AWS S3 / GCP Cloud Storage.

---

## 🐳 2. Production Docker Compose Deployment

### Prerequisites
* Docker Engine 24.0+
* Docker Compose v2.20+
* Domain with SSL certificates (Let's Encrypt / Certbot)

### Step-by-Step Deployment

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Leelajeevagan/GeoPulse-HyperLocal-Retail-Analytics.git
   cd GeoPulse-HyperLocal-Retail-Analytics
   ```

2. **Configure Environment Variables**:
   Create a `.env.production` file:
   ```env
   # Backend Settings
   DATABASE_URL=postgresql://geopulse_admin:SecretPass2026!@postgres:5432/geopulse_prod
   PYTHONUNBUFFERED=1
   CORS_ORIGINS=https://geopulse.yourdomain.com

   # Export & Storage
   EXPORTS_STORAGE_PATH=/app/exports
   MAX_EXPORT_STORAGE_GB=100
   ```

3. **Launch Containers**:
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```

4. **Verify Container Health**:
   ```bash
   docker compose ps
   curl -f http://localhost:8000/api/health
   ```

---

## 🗄️ 3. Production PostgreSQL Migration

To connect GeoPulse to an external managed database (AWS RDS, GCP Cloud SQL, or Supabase):

1. Set the connection string in your environment:
   ```bash
   export DATABASE_URL="postgresql+psycopg2://user:password@rds-endpoint:5432/geopulse"
   ```
2. Run database initialization and seed data:
   ```bash
   cd backend
   python -m app.database.seed_data
   ```

---

## 🔒 4. SSL & Nginx Reverse Proxy Configuration

Recommended Nginx configuration for production domain termination (`/etc/nginx/sites-available/geopulse`):

```nginx
server {
    listen 80;
    server_name geopulse.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name geopulse.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/geopulse.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/geopulse.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📈 5. Monitoring & Maintenance

* **Application Health**: `GET /api/health`
* **API Documentation**: `GET /docs` (Swagger UI) or `GET /redoc`
* **Database Backups**:
  ```bash
  pg_dump -h <host> -U <user> -d geopulse_prod > backup_$(date +%Y%m%d).sql
  ```
