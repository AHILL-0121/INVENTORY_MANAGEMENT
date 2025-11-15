from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import os
from dotenv import load_dotenv

load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/inventory_db")
SECRET_KEY = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# FastAPI app
app = FastAPI(title="Inventory Management System", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATABASE MODELS ====================

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum("admin", "staff"), nullable=False, default="staff")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    unit_price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    threshold = Column(Integer, nullable=False, default=10)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    inventory_logs = relationship("InventoryLog", back_populates="product")
    sales = relationship("Sale", back_populates="product")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    change_type = Column(Enum("purchase", "sale"), nullable=False)
    quantity = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="inventory_logs")

class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="sales")

# Create tables
Base.metadata.create_all(bind=engine)

# ==================== PYDANTIC SCHEMAS ====================

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "staff"

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ProductCreate(BaseModel):
    name: str
    category: str
    unit_price: float
    stock: int = 0
    threshold: int = 10

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    stock: Optional[int] = None
    threshold: Optional[int] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    category: str
    unit_price: float
    stock: int
    threshold: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class InventoryLogCreate(BaseModel):
    product_id: int
    change_type: str
    quantity: int

class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    change_type: str
    quantity: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class SaleCreate(BaseModel):
    product_id: int
    quantity: int

class SaleResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    total_price: float
    timestamp: datetime
    
    class Config:
        from_attributes = True

# ==================== DEPENDENCIES ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== AUTH ENDPOINTS ====================

@app.post("/auth/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ==================== PRODUCT ENDPOINTS ====================

@app.get("/products", response_model=List[ProductResponse])
def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    new_product = Product(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product.dict(exclude_unset=True).items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# ==================== INVENTORY ENDPOINTS ====================

@app.post("/inventory/purchase")
def log_purchase(
    log: InventoryLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == log.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update stock
    product.stock += log.quantity
    
    # Create log
    new_log = InventoryLog(
        product_id=log.product_id,
        change_type="purchase",
        quantity=log.quantity
    )
    db.add(new_log)
    db.commit()
    
    return {"message": "Purchase logged successfully", "new_stock": product.stock}

@app.post("/inventory/sale", response_model=SaleResponse)
def log_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == sale.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.stock < sale.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    # Update stock
    product.stock -= sale.quantity
    
    # Create inventory log
    new_log = InventoryLog(
        product_id=sale.product_id,
        change_type="sale",
        quantity=sale.quantity
    )
    db.add(new_log)
    
    # Create sale record
    new_sale = Sale(
        product_id=sale.product_id,
        quantity=sale.quantity,
        total_price=product.unit_price * sale.quantity
    )
    db.add(new_sale)
    db.commit()
    db.refresh(new_sale)
    
    return new_sale

@app.get("/inventory/logs", response_model=List[InventoryLogResponse])
def get_inventory_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(InventoryLog).order_by(InventoryLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/analytics/low-stock")
def get_low_stock(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    products = db.query(Product).filter(Product.stock < Product.threshold).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "stock": p.stock,
            "threshold": p.threshold
        }
        for p in products
    ]

@app.get("/analytics/fast-moving")
def get_fast_moving(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get sales from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    sales = db.query(
        Sale.product_id,
        Product.name,
        Product.category,
        db.func.sum(Sale.quantity).label("total_sold")
    ).join(Product).filter(
        Sale.timestamp >= thirty_days_ago
    ).group_by(Sale.product_id, Product.name, Product.category).order_by(
        db.func.sum(Sale.quantity).desc()
    ).limit(10).all()
    
    return [
        {
            "product_id": s.product_id,
            "name": s.name,
            "category": s.category,
            "total_sold": s.total_sold,
            "avg_per_day": round(s.total_sold / 30, 2)
        }
        for s in sales
    ]

@app.get("/analytics/forecast")
def get_forecast(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Get sales history
    sales = db.query(Sale).filter(Sale.product_id == product_id).order_by(Sale.timestamp).all()
    
    if len(sales) < 5:
        return {"error": "Insufficient data for forecasting (minimum 5 sales required)"}
    
    # Prepare data
    df = pd.DataFrame([
        {"date": s.timestamp, "quantity": s.quantity}
        for s in sales
    ])
    
    df['days'] = (df['date'] - df['date'].min()).dt.days
    
    # Group by day
    daily_sales = df.groupby('days')['quantity'].sum().reset_index()
    
    if len(daily_sales) < 3:
        return {"error": "Insufficient data points for forecasting"}
    
    # Simple linear regression
    X = daily_sales['days'].values.reshape(-1, 1)
    y = daily_sales['quantity'].values
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict next 30 days
    max_day = daily_sales['days'].max()
    future_days = np.array([[max_day + i] for i in range(1, 31)])
    predictions = model.predict(future_days)
    predictions = np.maximum(predictions, 0)  # No negative predictions
    
    return {
        "product_id": product_id,
        "forecast_days": 30,
        "predicted_demand": [
            {"day": int(i + 1), "quantity": max(0, round(float(pred), 2))}
            for i, pred in enumerate(predictions)
        ],
        "total_predicted": round(float(predictions.sum()), 2)
    }

@app.get("/analytics/sales-summary")
def get_sales_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    today = datetime.utcnow().date()
    week_ago = datetime.utcnow() - timedelta(days=7)
    month_ago = datetime.utcnow() - timedelta(days=30)
    
    # Today's sales
    today_sales = db.query(
        db.func.sum(Sale.total_price).label("revenue"),
        db.func.sum(Sale.quantity).label("items_sold")
    ).filter(db.func.date(Sale.timestamp) == today).first()
    
    # This week
    week_sales = db.query(
        db.func.sum(Sale.total_price).label("revenue"),
        db.func.sum(Sale.quantity).label("items_sold")
    ).filter(Sale.timestamp >= week_ago).first()
    
    # This month
    month_sales = db.query(
        db.func.sum(Sale.total_price).label("revenue"),
        db.func.sum(Sale.quantity).label("items_sold")
    ).filter(Sale.timestamp >= month_ago).first()
    
    # Total products
    total_products = db.query(Product).count()
    
    # Total stock value
    stock_value = db.query(
        db.func.sum(Product.stock * Product.unit_price)
    ).scalar() or 0
    
    return {
        "today": {
            "revenue": float(today_sales.revenue or 0),
            "items_sold": int(today_sales.items_sold or 0)
        },
        "week": {
            "revenue": float(week_sales.revenue or 0),
            "items_sold": int(week_sales.items_sold or 0)
        },
        "month": {
            "revenue": float(month_sales.revenue or 0),
            "items_sold": int(month_sales.items_sold or 0)
        },
        "total_products": total_products,
        "stock_value": round(float(stock_value), 2)
    }

@app.get("/analytics/revenue-trend")
def get_revenue_trend(days: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sales = db.query(
        db.func.date(Sale.timestamp).label("date"),
        db.func.sum(Sale.total_price).label("revenue")
    ).filter(
        Sale.timestamp >= start_date
    ).group_by(
        db.func.date(Sale.timestamp)
    ).order_by(
        db.func.date(Sale.timestamp)
    ).all()
    
    return [
        {
            "date": str(s.date),
            "revenue": float(s.revenue)
        }
        for s in sales
    ]

# ==================== ROOT ====================

@app.get("/")
def root():
    return {
        "message": "Inventory Management System API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
