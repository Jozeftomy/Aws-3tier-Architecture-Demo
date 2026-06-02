from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import CartItem, Product, User
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartItemResponse, CartResponse

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.get("", response_model=CartResponse)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    total_amount = sum(item.quantity * item.product.price for item in items if item.product)
    
    return {
        "items": items,
        "total_amount": total_amount
    }

@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == item_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_quantity} units available in stock"
        )
        
    # Check if item is already in user's cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item_in.product_id
    ).first()
    
    if existing_item:
        new_quantity = existing_item.quantity + item_in.quantity
        if product.stock_quantity < new_quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot add more. Max {product.stock_quantity} units available in stock"
            )
        existing_item.quantity = new_quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
        
    # Create new cart item
    cart_item = CartItem(
        user_id=current_user.id,
        product_id=item_in.product_id,
        quantity=item_in.quantity
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.put("/items/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    item_in: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    product = cart_item.product
    if not product:
        raise HTTPException(status_code=404, detail="Product associated with cart item no longer exists")
        
    if product.stock_quantity < item_in.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Only {product.stock_quantity} units available in stock"
        )
        
    if item_in.quantity <= 0:
        db.delete(cart_item)
        db.commit()
        raise HTTPException(status_code=status.HTTP_204_NO_CONTENT, detail="Item removed")
        
    cart_item.quantity = item_in.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    db.delete(cart_item)
    db.commit()
    return None

@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return None
