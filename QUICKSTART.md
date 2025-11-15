# ⚡ Quick Start Guide

Get the Inventory Analytics System running in **5 minutes**!

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18+ and npm ([Download](https://nodejs.org/))
- ✅ **Python** 3.9+ ([Download](https://www.python.org/))
- ✅ **MySQL** 8.0+ ([Download](https://dev.mysql.com/downloads/))
- ✅ **Git** ([Download](https://git-scm.com/))

---

## 🚀 Installation Steps

### Step 1️⃣: Clone Repository

```bash
git clone https://github.com/yourusername/inventory-system.git
cd inventory-system
```

---

### Step 2️⃣: Backend Setup (5 commands)

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create database
mysql -u root -p -e "CREATE DATABASE inventory_db;"

# Setup environment
cp .env.example .env
# ⚠️ IMPORTANT: Edit .env and update your MySQL password!

# Start backend server
python main.py
```

✅ **Backend running at:** http://localhost:8000  
📚 **API Docs:** http://localhost:8000/docs

---

### Step 3️⃣: Frontend Setup (3 commands)

Open a **new terminal** and:

```bash
# Navigate to frontend
cd frontend

# Install dependencies (takes 2-3 minutes)
npm install

# Create environment file
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

# Start development server
npm run dev
```

✅ **Frontend running at:** http://localhost:3000

---

### Step 4️⃣: Create Admin User

Visit the API documentation: **http://localhost:8000/docs**

1. Find and click on **`POST /auth/signup`**
2. Click **"Try it out"**
3. Paste this JSON:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

4. Click **"Execute"**
5. You should see a success response with a token! 🎉

---

### Step 5️⃣: Login and Explore

🌐 Open: **http://localhost:3000**

**Login Credentials:**
- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## 🎯 What You Can Do Now

### 📊 Dashboard
- View real-time metrics (products, sales, revenue)
- See revenue trend chart
- Monitor low stock alerts
- Check fast-moving items

### 📦 Products (Admin Only)
- Add new products
- Edit existing products
- Delete products
- Set stock thresholds

### 📝 Inventory
- Log purchase transactions
- Record sales
- View transaction history

### 📈 Analytics
- View demand forecasts (30-day predictions)
- Analyze fast-moving products
- Track low stock items

---

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** `Access denied for user 'root'@'localhost'`

**Solution:**
1. Open `backend/.env`
2. Update the DATABASE_URL with correct MySQL password:
   ```env
   DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/inventory_db
   ```

### Frontend Shows Errors

**Problem:** TypeScript errors or module not found

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Connection Failed

**Problem:** Can't connect to MySQL

**Solution:**
```bash
# Check if MySQL is running
mysql --version

# Start MySQL service
# Windows: Services → MySQL → Start
# Linux: sudo systemctl start mysql
# Mac: brew services start mysql
```

### Port Already in Use

**Problem:** Port 3000 or 8000 already in use

**Solution:**
```bash
# Find and kill process on port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

---

## 📚 Next Steps

- 📖 Read the [Full Documentation](README.md)
- 🚀 Check [Deployment Guide](DEPLOYMENT.md) for cloud deployment
- 🤝 Read [Contributing Guide](CONTRIBUTING.md) to contribute
- 🐛 Report issues on [GitHub Issues](https://github.com/yourusername/inventory-system/issues)

---

## 💡 Pro Tips

### Create Staff User

For testing role-based access:

```json
{
  "name": "Staff User",
  "email": "staff@example.com",
  "password": "staff123",
  "role": "staff"
}
```

Staff users can **view** but **cannot edit/delete** products.

### Development Workflow

**Backend:**
```bash
# Run in watch mode (restarts on file changes)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### VS Code Extensions (Recommended)

- **Python** by Microsoft
- **Pylance** (Python language server)
- **ESLint** (JavaScript/TypeScript linting)
- **Tailwind CSS IntelliSense**
- **Prettier** (Code formatter)

---

## 🎉 Success!

Your inventory system is now running!

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Happy coding! 🚀**

---

## 📞 Need Help?

- 💬 Join our [Discord Community](#)
- 📧 Email: support@example.com
- 🐛 [Report a Bug](https://github.com/yourusername/inventory-system/issues/new?template=bug_report.md)
- ✨ [Request a Feature](https://github.com/yourusername/inventory-system/issues/new?template=feature_request.md)

---

**Made with ❤️ for inventory management**
