from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, get_current_admin
from app.models.models import Order, OrderItem, CartItem, Product, User, Admin
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user's cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place order with empty cart"
        )
        
    # Transactional check: verify stock for all items first
    items_to_process = []
    total_amount = 0.0
    
    for item in cart_items:
        product = item.product
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with ID {item.product_id} no longer exists"
            )
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.name}' has insufficient stock. Only {product.stock_quantity} remaining."
            )
        items_to_process.append((item, product))
        total_amount += product.price * item.quantity

    # Create the Order
    order = Order(
        user_id=current_user.id,
        status="PENDING",
        total_amount=total_amount,
        shipping_address=order_in.shipping_address,
        phone=order_in.phone
    )
    db.add(order)
    db.flush()  # Flush to get the order ID

    # Create OrderItems and reduce product stock
    for cart_item, product in items_to_process:
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price=product.price
        )
        db.add(order_item)
        
        # Deduct stock
        product.stock_quantity -= cart_item.quantity

    # Clear user's cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

# Admin endpoint: get all orders
@router.get("/admin/all", response_model=List[OrderResponse])
def get_all_orders_admin(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_details(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Standard user can only view their own orders
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this order"
        )
    return order

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    order_in: OrderUpdate,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    valid_statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]
    status_upper = order_in.status.upper()
    if status_upper not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of {valid_statuses}"
        )
        
    order.status = status_upper
    db.commit()
    db.refresh(order)
    return order
