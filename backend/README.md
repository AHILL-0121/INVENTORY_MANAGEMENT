# Backend Setup

## Prerequisites
- Python 3.9+
- MySQL 8.0+

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create MySQL database:
```sql
CREATE DATABASE inventory_db;
```

3. Create `.env` file from `.env.example` and update credentials

4. Run the server:
```bash
python main.py
```

Server will start at: http://localhost:8000
API docs: http://localhost:8000/docs

## Default Admin User
After first run, create admin user via `/auth/signup` endpoint or directly in database.
