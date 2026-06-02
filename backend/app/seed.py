from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import User, Admin, Category, Product, Order, OrderItem

def seed_db():
    # Recreate tables from scratch to apply schema changes
    print("Dropping existing tables to apply schema modifications...")
    Base.metadata.drop_all(bind=engine)
    print("Creating new database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Checking if seeding is required...")
        
        # 1. Seed Admin User
        admin_user = db.query(Admin).filter(Admin.email == "admin@ecommerce.com").first()
        if not admin_user:
            print("Seeding admin user...")
            admin_user = Admin(
                email="admin@ecommerce.com",
                hashed_password=get_password_hash("adminpassword123"),
                full_name="System Admin"
            )
            db.add(admin_user)
            db.commit()
            print("Admin user created (email: admin@ecommerce.com, password: adminpassword123)")
        else:
            print("Admin user already exists in admins table.")

        # 2. Seed Categories
        categories_data = [
            {"name": "Electronics", "slug": "electronics", "description": "Laptops, phones, smartwatches, and accessories."},
            {"name": "Fashion", "slug": "fashion", "description": "Trendy clothes, shoes, bags, and accessories."},
            {"name": "Home & Kitchen", "slug": "home-kitchen", "description": "Kitchen appliances, home decor, and utensils."},
            {"name": "Books", "slug": "books", "description": "Educational, fiction, non-fiction, and sci-fi books."}
        ]
        
        seeded_categories = {}
        for cat_info in categories_data:
            cat = db.query(Category).filter(Category.slug == cat_info["slug"]).first()
            if not cat:
                print(f"Seeding category: {cat_info['name']}...")
                cat = Category(**cat_info)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            seeded_categories[cat.slug] = cat.id
            
        # 3. Seed Products
        products_data = [
            {
                "name": "Wireless Noise-Cancelling Headphones",
                "slug": "wireless-noise-cancelling-headphones",
                "description": "Experience deep, immersive sound with these active noise-cancelling wireless over-ear headphones. Features 40-hour battery life and Bluetooth 5.2.",
                "price": 149.99,
                "stock_quantity": 25,
                "category_slug": "electronics",
                "image_url": "/static/uploads/noise_headphones.png"
            },
            {
                "name": "Smart Fitness Watch v2",
                "slug": "smart-fitness-watch-v2",
                "description": "Track your heart rate, sleep steps, and activities in real-time. Water-resistant up to 50m with a bright AMOLED screen.",
                "price": 89.99,
                "stock_quantity": 40,
                "category_slug": "electronics",
                "image_url": "/static/uploads/fitness_watch.png"
            },
            {
                "name": "Minimalist Canvas Backpack",
                "slug": "minimalist-canvas-backpack",
                "description": "Durable water-resistant canvas backpack with a 15-inch laptop compartment. Perfect for daily commutes, school, and travel.",
                "price": 45.00,
                "stock_quantity": 15,
                "category_slug": "fashion",
                "image_url": "/static/uploads/canvas_backpack.png"
            },
            {
                "name": "Classic Denim Jacket",
                "slug": "classic-denim-jacket",
                "description": "Timeless vintage denim jacket made from 100% premium cotton. Features metal button closures and front flap chest pockets.",
                "price": 65.00,
                "stock_quantity": 20,
                "category_slug": "fashion",
                "image_url": "/static/uploads/denim_jacket.png"
            },
            {
                "name": "Electric Drip Coffee Maker",
                "slug": "electric-drip-coffee-maker",
                "description": "Brew up to 12 cups of hot, fresh coffee with this programmable drip machine. Features auto-shutoff and brew strength control.",
                "price": 59.99,
                "stock_quantity": 10,
                "category_slug": "home-kitchen",
                "image_url": "/static/uploads/coffee_maker.png"
            },
            {
                "name": "Stainless Steel Kitchen Knife Set",
                "slug": "kitchen-knife-set",
                "description": "Professional 8-piece high-carbon stainless steel knife set with ergonomic handles and a stylish wooden display block.",
                "price": 120.00,
                "stock_quantity": 8,
                "category_slug": "home-kitchen",
                "image_url": "/static/uploads/knife_set.png"
            },
            {
                "name": "Designing Clean Architectures",
                "slug": "designing-clean-architectures",
                "description": "Learn the principles of SOLID design patterns, domain-driven design, and clean backend structure from seasoned software engineers.",
                "price": 29.99,
                "stock_quantity": 50,
                "category_slug": "books",
                "image_url": "/static/uploads/clean_architecture_book.png"
            }
        ]
        
        for prod_info in products_data:
            prod = db.query(Product).filter(Product.slug == prod_info["slug"]).first()
            if not prod:
                print(f"Seeding product: {prod_info['name']}...")
                cat_slug = prod_info.pop("category_slug")
                prod_info["category_id"] = seeded_categories.get(cat_slug)
                prod = Product(**prod_info)
                db.add(prod)
                db.commit()
                
        # Seed Customer Users
        customer_1 = db.query(User).filter(User.email == "customer@ecommerce.com").first()
        if not customer_1:
            print("Seeding customer 1...")
            customer_1 = User(
                email="customer@ecommerce.com",
                hashed_password=get_password_hash("password123"),
                full_name="Alice Smith"
            )
            db.add(customer_1)
            db.commit()
            db.refresh(customer_1)
        
        customer_2 = db.query(User).filter(User.email == "john.doe@example.com").first()
        if not customer_2:
            print("Seeding customer 2...")
            customer_2 = User(
                email="john.doe@example.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Doe"
            )
            db.add(customer_2)
            db.commit()
            db.refresh(customer_2)

        # Seed Sample Orders
        order_count = db.query(Order).count()
        if order_count == 0:
            print("Seeding sample orders...")
            headphones = db.query(Product).filter(Product.slug == "wireless-noise-cancelling-headphones").first()
            watch = db.query(Product).filter(Product.slug == "smart-fitness-watch-v2").first()
            backpack = db.query(Product).filter(Product.slug == "minimalist-canvas-backpack").first()
            
            # Order 1 (Alice Smith)
            if headphones:
                order_1 = Order(
                    user_id=customer_1.id,
                    status="PAID",
                    total_amount=headphones.price,
                    shipping_address="123 Main St, Seattle, WA 98101",
                    phone="206-555-0199"
                )
                db.add(order_1)
                db.flush()
                item_1 = OrderItem(
                    order_id=order_1.id,
                    product_id=headphones.id,
                    quantity=1,
                    price=headphones.price
                )
                db.add(item_1)
            
            # Order 2 (John Doe)
            if watch and backpack:
                total_amount_2 = watch.price + (backpack.price * 2)
                order_2 = Order(
                    user_id=customer_2.id,
                    status="PENDING",
                    total_amount=total_amount_2,
                    shipping_address="456 Oak Ave, San Francisco, CA 94102",
                    phone="415-555-0145"
                )
                db.add(order_2)
                db.flush()
                item_2a = OrderItem(
                    order_id=order_2.id,
                    product_id=watch.id,
                    quantity=1,
                    price=watch.price
                )
                item_2b = OrderItem(
                    order_id=order_2.id,
                    product_id=backpack.id,
                    quantity=2,
                    price=backpack.price
                )
                db.add(item_2a)
                db.add(item_2b)
            
            db.commit()
            print("Sample orders seeded successfully!")
            
        print("Seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seeding failed: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
