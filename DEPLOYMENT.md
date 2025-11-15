# 🚀 Deployment Guide

Complete guide for deploying the Inventory Analytics System to production.

## 📋 Table of Contents

- [AWS Deployment](#aws-deployment)
- [Docker Deployment](#docker-deployment)
- [Heroku Deployment](#heroku-deployment)
- [Azure Deployment](#azure-deployment)
- [Environment Variables](#environment-variables)
- [SSL/HTTPS Setup](#ssl-https-setup)

---

## ☁️ AWS Deployment

### Architecture Overview

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Vercel    │───▶│  EC2 (API)   │───▶│  RDS MySQL  │
│  (Frontend) │    │   + Nginx    │    │  (Database) │
└─────────────┘    └──────────────┘    └─────────────┘
```

### Step 1: Setup RDS MySQL Database

1. **Create RDS Instance:**
   - Go to AWS Console → RDS → Create Database
   - Engine: MySQL 8.0
   - Template: Free tier (or Production based on needs)
   - DB Instance: db.t3.micro (minimum)
   - Storage: 20 GB SSD
   - Multi-AZ: Disabled (enable for production)

2. **Configure Security Group:**
   ```
   Inbound Rules:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: EC2 Security Group
   ```

3. **Create Database:**
   ```bash
   mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p
   CREATE DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

4. **Note Credentials:**
   - Endpoint: `your-rds-endpoint.rds.amazonaws.com`
   - Username: `admin`
   - Password: `your-password`
   - Database: `inventory_db`

### Step 2: Setup EC2 Instance (Backend)

1. **Launch EC2 Instance:**
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t2.micro (minimum)
   - Storage: 8 GB (minimum)
   - Security Group:
     ```
     Inbound Rules:
     - SSH (22) from Your IP
     - HTTP (80) from 0.0.0.0/0
     - HTTPS (443) from 0.0.0.0/0
     - Custom TCP (8000) from 0.0.0.0/0
     ```

2. **Connect to Instance:**
   ```bash
   chmod 400 your-key.pem
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

3. **Install Dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Python and tools
   sudo apt install python3-pip python3-venv nginx git -y

   # Install MySQL client
   sudo apt install mysql-client -y
   ```

4. **Clone and Setup Application:**
   ```bash
   # Clone repository
   cd ~
   git clone https://github.com/yourusername/inventory-system.git
   cd inventory-system/backend

   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate

   # Install Python dependencies
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Configure Environment:**
   ```bash
   nano .env
   ```
   
   Add:
   ```env
   DATABASE_URL=mysql+pymysql://admin:password@your-rds-endpoint.rds.amazonaws.com:3306/inventory_db
   SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

6. **Create Systemd Service:**
   ```bash
   sudo nano /etc/systemd/system/inventory-api.service
   ```

   Add:
   ```ini
   [Unit]
   Description=Inventory Management API
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/inventory-system/backend
   Environment="PATH=/home/ubuntu/inventory-system/backend/venv/bin"
   ExecStart=/home/ubuntu/inventory-system/backend/venv/bin/python main.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

   Enable and start:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable inventory-api
   sudo systemctl start inventory-api
   sudo systemctl status inventory-api
   ```

7. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/inventory-api
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;  # Change this

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/inventory-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Step 3: Deploy Frontend (Vercel)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Configure Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=http://your-ec2-ip:8000
   # Or with domain: https://api.yourdomain.com
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Step 4: Setup SSL/HTTPS (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already setup by certbot)
sudo systemctl status certbot.timer
```

### Step 5: Create Admin User

```bash
# Use API docs at https://api.yourdomain.com/docs
# Or use curl:
curl -X POST "https://api.yourdomain.com/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
```

**Frontend Dockerfile:**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

### Step 2: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: inventory_db
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build: ./backend
    environment:
      DATABASE_URL: mysql+pymysql://root:rootpassword@mysql:3306/inventory_db
      SECRET_KEY: your-secret-key-here
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 30
    ports:
      - "8000:8000"
    depends_on:
      mysql:
        condition: service_healthy

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### Step 3: Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Remove volumes
docker-compose down -v
```

---

## 🟣 Heroku Deployment

### Backend (Heroku)

1. **Create Procfile:**
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

2. **Create runtime.txt:**
   ```
   python-3.11.0
   ```

3. **Deploy:**
   ```bash
   heroku login
   heroku create your-app-backend
   heroku addons:create jawsdb:kitefin  # MySQL addon
   
   # Get database URL
   heroku config:get JAWSDB_URL
   
   # Set environment variables
   heroku config:set SECRET_KEY=your-secret-key
   heroku config:set ALGORITHM=HS256
   heroku config:set DATABASE_URL=mysql+pymysql://...
   
   git push heroku main
   ```

### Frontend (Vercel)

Same as AWS deployment above.

---

## ☁️ Azure Deployment

### Backend (Azure App Service)

1. **Create App Service:**
   ```bash
   az webapp up --name your-api-name --runtime "PYTHON:3.11"
   ```

2. **Configure MySQL:**
   - Create Azure Database for MySQL
   - Get connection string
   - Set in App Service Configuration

3. **Deploy:**
   ```bash
   az webapp deployment source config-zip --src backend.zip
   ```

### Frontend (Azure Static Web Apps)

```bash
az staticwebapp create \
  --name your-frontend \
  --resource-group your-rg \
  --source https://github.com/yourusername/inventory-system \
  --location "East US" \
  --branch main \
  --app-location "frontend" \
  --api-location "" \
  --output-location ".next"
```

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=mysql+pymysql://user:password@host:port/database

# JWT Authentication
SECRET_KEY=your-super-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Optional: CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Cloudflare (Free SSL + CDN)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable "Full (Strict)" SSL mode
4. Set up page rules for caching

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/inventory-system
            git pull origin main
            cd backend
            source venv/bin/activate
            pip install -r requirements.txt
            sudo systemctl restart inventory-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

---

## 📊 Monitoring

### Application Monitoring

```bash
# Install monitoring tools
pip install prometheus-client
npm install @vercel/analytics
```

### Health Checks

- Backend: `GET /docs` (should return 200)
- Database: Check RDS metrics in AWS Console
- Frontend: Check Vercel deployment logs

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u inventory-api -f

# Check process
ps aux | grep python

# Test manually
cd ~/inventory-system/backend
source venv/bin/activate
python main.py
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h your-rds-endpoint -u admin -p

# Check security groups
# Ensure EC2 can access RDS (port 3306)
```

### Frontend Build Errors

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 📝 Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Database connection working
- [ ] SSL certificate installed
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] Admin user created
- [ ] CORS configured correctly
- [ ] Monitoring setup
- [ ] Backups configured
- [ ] Domain DNS updated

---

**🎉 Congratulations! Your application is now live!**

For support, open an issue on GitHub or contact the maintainers.
