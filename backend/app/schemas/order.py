from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.schemas.product import ProductResponse

class OrderCreate(BaseModel):
    shipping_address: str
    phone: str

class OrderUpdate(BaseModel):
    status: str

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

from app.schemas.user import UserResponse

class OrderResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    status: str
    total_amount: float
    shipping_address: str
    phone: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
