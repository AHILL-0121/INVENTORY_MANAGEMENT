# 📦 Inventory Analytics System

> A production-ready full-stack inventory management system with ML-powered analytics and forecasting capabilities.

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Features

### Core Functionality
- 🔐 **JWT Authentication** with role-based access (Admin/Staff)
- 📊 **Product Management** with full CRUD operations
- 📈 **Real-time Analytics Dashboard** with interactive charts
- 🔔 **Smart Alerts** for low stock and fast-moving items
- 🤖 **ML-Powered Forecasting** using scikit-learn Linear Regression
- 📱 **Responsive Design** with beautiful shadcn/ui components
- ⚡ **Skeleton Loading States** for smooth UX

### Analytics Engine
- 📉 Low stock detection with configurable thresholds
- 🚀 Fast-moving items identification
- 💰 Revenue trend visualization (30-day window)
- 🔮 Demand forecasting for inventory planning

## 🏗️ Architecture

```
inventory-system/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
│   ├── app/          # App Router pages
│   ├── components/   # shadcn/ui components
│   └── lib/          # Utilities and API client
│
├── backend/          # FastAPI + SQLAlchemy + Python
│   ├── main.py       # Application entry point
│   ├── requirements.txt
│   └── .env          # Environment configuration
│
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **MySQL** 8.0+
- **Git**

### Local Development Setup

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/inventory-system.git
cd inventory-system
```

#### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create database
mysql -u root -p -e "CREATE DATABASE inventory_db;"

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start backend
python main.py
```

**Backend runs at:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

#### 3️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

**Frontend runs at:** http://localhost:3000

#### 4️⃣ Create Admin User

Visit http://localhost:8000/docs and use `/auth/signup`:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**Login Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## ☁️ Cloud Deployment

### AWS Deployment (Recommended)

#### Backend (EC2 + RDS)

1. **Launch EC2 Instance** (Ubuntu 22.04 LTS)
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip python3-venv nginx -y

# Clone repository
git clone https://github.com/yourusername/inventory-system.git
cd inventory-system/backend

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure systemd service
sudo nano /etc/systemd/system/inventory-api.service
```

**Service file content:**
```ini
[Unit]
Description=Inventory API Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/inventory-system/backend
Environment="PATH=/home/ubuntu/inventory-system/backend/venv/bin"
ExecStart=/home/ubuntu/inventory-system/backend/venv/bin/python main.py

[Install]
WantedBy=multi-user.target
```

2. **Setup RDS MySQL Database**
```bash
# In AWS Console:
# - Create RDS MySQL 8.0 instance
# - Configure security group (allow port 3306)
# - Note down endpoint and credentials

# Update .env file
DATABASE_URL=mysql+pymysql://admin:password@your-rds-endpoint:3306/inventory_db
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **Start Service**
```bash
sudo systemctl enable inventory-api
sudo systemctl start inventory-api
sudo systemctl enable nginx
sudo systemctl restart nginx
```

#### Frontend (Vercel - One-Click Deploy)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/inventory-system)

Or manual:
```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Your backend URL (e.g., https://api.yourdomain.com)

### Alternative: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

See `DEPLOYMENT.md` for detailed instructions.

## 📚 Documentation

- [📖 API Documentation](http://localhost:8000/docs) - Interactive Swagger UI
- [🚀 Deployment Guide](DEPLOYMENT.md) - Production deployment steps
- [🔧 Configuration Guide](docs/CONFIGURATION.md) - Environment setup
- [🤝 Contributing Guide](CONTRIBUTING.md) - Development guidelines

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.3
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Charts:** Recharts 2.10
- **HTTP Client:** Axios 1.6
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI 0.104
- **ORM:** SQLAlchemy 2.0
- **Database Driver:** PyMySQL 1.1
- **Authentication:** python-jose (JWT)
- **Password Hashing:** passlib with bcrypt
- **ML Library:** scikit-learn 1.3
- **Data Processing:** pandas 2.1, numpy 1.26

### Database
- **Primary:** MySQL 8.0+
- **Schema:** 4 tables (users, products, inventory_logs, sales)

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ bcrypt password hashing (cost factor: 12)
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ SQL injection prevention (ORM)
- ✅ Environment variable management
- ✅ Secure HTTP headers

## 📊 Database Schema

```sql
Users (id, name, email, hashed_password, role, created_at)
Products (id, name, category, unit_price, stock, threshold, created_at)
InventoryLogs (id, product_id, change_type, quantity, timestamp)
Sales (id, product_id, quantity, total_price, sale_date)
```

## 🎨 UI/UX Design

- **Primary Color:** Green (#22c55e) - no purple theme
- **Font:** Inter
- **Components:** Fully accessible shadcn/ui components
- **Loading States:** Skeleton loaders on all data-fetching operations
- **Responsive:** Mobile-first design approach

## 🤖 Machine Learning

**Forecasting Algorithm:**
- Model: Linear Regression (scikit-learn)
- Features: Historical sales data with time series
- Output: 30-day demand predictions
- Use Case: Inventory planning and restocking

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📈 Performance

- Frontend: < 2s initial load
- API response: < 100ms average
- Database queries: Optimized with indexes
- ML predictions: < 1s for 30-day forecast

## 🔄 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Products
- `GET /products` - List all products
- `POST /products` - Create product (Admin)
- `PUT /products/{id}` - Update product (Admin)
- `DELETE /products/{id}` - Delete product (Admin)

### Inventory
- `POST /inventory/purchase` - Log purchase
- `POST /inventory/sale` - Log sale
- `GET /inventory/logs` - Transaction history

### Analytics
- `GET /analytics/low-stock` - Low stock alerts
- `GET /analytics/fast-moving` - Top selling items
- `GET /analytics/forecast?product_id={id}` - Demand forecast
- `GET /analytics/sales-summary` - Daily sales totals
- `GET /analytics/revenue-trend?days={n}` - Revenue chart data

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [FastAPI](https://fastapi.tiangolo.com/) for excellent API framework
- [Next.js](https://nextjs.org/) for modern React framework

## 📧 Contact

**Project Maintainer:** AHILL S 
**Email:** sa.education5211@gmail.com 
**GitHub:** [@AHILL-0121](https://github.com/AHILL-0121)

---

⭐ **Star this repo if you find it helpful!**

Made with ❤️ and ☕
