# SwiftCart - Full-Stack eCommerce Web Application

SwiftCart is a clean, modern, and production-ready small-scale eCommerce application. It features a responsive React SPA frontend built with Vite & Tailwind CSS, and a modular Python backend powered by FastAPI, SQLAlchemy, and PostgreSQL.

---

## Table of Contents
1. [Application Architecture](#1-application-architecture)
2. [Frontend-Backend Communication Flow](#2-frontend-backend-communication-flow)
3. [Authentication Flow](#3-authentication-flow)
4. [Database Relationships](#4-database-relationships)
5. [Folder Structure](#5-folder-structure)
6. [Step-by-Step Local Setup](#6-step-by-step-local-setup)

---

## 1. Application Architecture

SwiftCart follows a decoupled Client-Server architecture:

```
┌─────────────────────────────────┐          ┌─────────────────────────────────┐
│        REACT CLIENT (SPA)       │          │      FASTAPI BACKEND (API)      │
│  - Vite (Build Tool)            │  HTTP    │  - Routers (API Endpoints)      │
│  - Tailwind CSS (Styling)       │ ◄──────► │  - Core (Config, Auth)          │
│  - Context API (State Sync)     │  JSON    │  - Models (SQLAlchemy ORM)      │
│  - Axios (API Service Layer)    │          │  - Schemas (Pydantic Validation)│
└─────────────────────────────────┘          └────────────────┬────────────────┘
                                                              │
                                                              ▼
                                                     ┌─────────────────┐
                                                     │  POSTGRESQL DB  │
                                                     │ (Data Storage)  │
                                                     └─────────────────┘
```

- **Frontend**: Operates as a Single Page Application (SPA). React Router manages client-side navigation. Axios encapsulates remote API communications. Context API handles global states for authentication sessions, shopping carts, and UI toast alerts.
- **Backend**: Built using a modular layered architecture where HTTP routes, request/response validation (Pydantic), and database operations are separated into routers, schemas, and models respectively.
- **Database**: Relational PostgreSQL database managed using SQLAlchemy ORM. Tables are automatically initialized on application boot for convenience, and Alembic configuration is provided for migration tracking.

---

## 2. Frontend-Backend Communication Flow

1. **API Requests**: The client initiates requests using an Axios instance configured in `src/services/api.js`.
2. **Dynamic Headers**: An Axios interceptor automatically checks for a `token` in `localStorage` and appends it to outgoing requests as `Authorization: Bearer <JWT_TOKEN>`.
3. **Response Interception**: If any API response returns a `401 Unauthorized` (e.g. expired session), an interceptor clears local storage and triggers a logout event to reset the client state.
4. **Data Validation**: FastAPI validates incoming request payloads against Pydantic schemas. If invalid, it automatically returns a structured `422 Unprocessable Entity` response.
5. **CORS Middlewares**: FastAPI allows incoming requests from the React client development server (usually `http://localhost:5173`) by setting appropriate CORS headers.

---

## 3. Authentication Flow

SwiftCart implements secure, stateless JWT (JSON Web Token) authentication:

```
[ User Client ]                   [ Auth API ]                   [ Database ]
       │                                │                             │
       │─── 1. POST /auth/register ────►│                             │
       │                                │─── 2. Hashed with bcrypt ──►│
       │                                │◄── 3. Saved Profile ────────│
       │◄── 4. 201 Created Response ────│                             │
       │                                │                             │
       │─── 5. POST /auth/login ───────►│                             │
       │                                │─── 6. Query User Record ───►│
       │                                │◄── 7. Verify bcrypt Hash ───│
       │                                │                             │
       │                                │─── 8. Generate JWT Token ───│
       │◄── 9. JWT Token & Profile ─────│                             │
       │                                │                             │
       │─── 10. GET /auth/me (Bearer) ─►│                             │
       │◄── 11. Return Profile ─────────│                             │
```

- **Password Security**: Plaintext passwords are never saved; they are hashed using `bcrypt` (via `passlib`) before insertion.
- **Token Generation**: On login, FastAPI signs a JWT containing the user ID as the subject (`sub`) and an expiration timestamp (expires in 24 hours).
- **Session Handlers**: The client saves the JWT in `localStorage`. Access is maintained via the `AuthContext` wrapper, which protects routes like `/cart`, `/checkout`, and `/orders`.
- **Role-Based Access**: The JWT subject payload maps to a user database record containing `is_admin`. Administrative endpoints (e.g., product CRUD, status updates) require `Depends(get_current_admin)`.

---

## 4. Database Relationships

The database consists of six core tables:

```
   ┌──────────┐             ┌──────────────┐
   │  users   │1           *│    orders    │
   ├──────────┤────────────►├──────────────┤
   │ id (PK)  │             │ id (PK)      │
   │ email    │             │ status       │
   │ hash_pwd │             │ total_amount │
   │ is_admin │             │ user_id (FK) │
   └────┬─────┘             └──────┬───────┘
        │1                         │1
        │                          │
        │*                         │*
   ┌────▼─────┐             ┌──────▼───────┐
   │cart_items│             │ order_items  │
   ├──────────┤             ├──────────────┤
   │ id (PK)  │             │ id (PK)      │
   │ quantity │             │ quantity     │
   │ user_id  │             │ price        │
   │ prod_id  │             │ order_id(FK) │
   └────┬─────┘             │ prod_id (FK) │
        │*                  └──────┬───────┘
        │                          │*
        │*                         │
   ┌────▼─────┐                    │
   │ products │◄───────────────────┘
   ├──────────┤
   │ id (PK)  │             ┌──────────────┐
   │ name,slug│            1│  categories  │
   │ price    │◄────────────├──────────────┤
   │ cat_id   │*            │ id (PK)      │
   └──────────┘             │ name, slug   │
                            └──────────────┘
```

1. **User ↔ CartItem** (One-to-Many): A user has multiple cart items representing their pending shopping cart. If a user is deleted, their cart is deleted (`cascade="all, delete-orphan"`).
2. **Product ↔ CartItem** (One-to-Many): A product can exist in multiple users' carts.
3. **Category ↔ Product** (One-to-Many): Products belong to a category. If a category is deleted, product categories are set to NULL.
4. **User ↔ Order** (One-to-Many): A user has an order history.
5. **Order ↔ OrderItem** (One-to-Many): An order contains multiple purchased items. Deleting an order deletes its items.
6. **Product ↔ OrderItem** (One-to-Many): Order items record the product id and historical purchase price. If a product is deleted, the purchase log persists with product ID set to NULL.

---

## 5. Folder Structure

```
AWS_Project_1/
├── backend/
│   ├── alembic/                # Database migrations directory
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py       # Configuration and Env variables parsing
│   │   │   ├── database.py     # SQLAlchemy DB connection setup
│   │   │   ├── dependencies.py # User and Admin auth dependencies
│   │   │   └── security.py     # Hashing and JWT helpers
│   │   ├── models/
│   │   │   └── models.py       # SQLAlchemy database schemas
│   │   ├── routers/
│   │   │   ├── auth.py         # Login, Register, Profile endpoints
│   │   │   ├── categories.py   # Public listing / Admin CRUD
│   │   │   ├── products.py     # Paginated list, search, image uploads
│   │   │   ├── cart.py         # Add, update, delete cart items
│   │   │   └── orders.py       # Checkout, user orders, admin moderation
│   │   ├── schemas/            # Pydantic validation schemas
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── category.py
│   │   │   ├── cart.py
│   │   │   └── order.py
│   │   ├── main.py             # Entry point, mounts CORS & static files
│   │   └── seed.py             # Data seeding script
│   ├── static/
│   │   └── uploads/            # Location where product pictures are saved
│   ├── alembic.ini             # Alembic configuration
│   ├── requirements.txt        # Backend dependencies
│   └── .env.example            # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── components/         # Reusable layouts
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx # Route guard for logged in users
    │   │   └── AdminRoute.jsx     # Route guard for admin users
    │   ├── context/            # Context state managers
    │   │   ├── AuthContext.jsx
    │   │   ├── CartContext.jsx
    │   │   └── ToastContext.jsx   # Premium alert notifications
    │   ├── pages/              # View pages
    │   │   ├── Home.jsx           # Catalog browsing page
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── ProductDetails.jsx # Catalog detail page
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx       # Mock credit gateway order placement
    │   │   ├── Orders.jsx         # Status tracker & historical view
    │   │   ├── AdminDashboard.jsx # Inventory CRUD & Status moderation
    │   │   └── AdminLogin.jsx     # Authorized console login page
    │   ├── services/
    │   │   └── api.js          # Axios client instance
    │   ├── App.jsx             # React routing setup
    │   ├── main.jsx            # DOM mounting entry point
    │   └── index.css           # Tailwind loading & Toast slide keyframes
    ├── tailwind.config.js      # Styling themes config
    ├── postcss.config.js       # Pre-processor config
    ├── package.json            # Node project requirements
    └── .env.example            # Vite environment template
```

---

## 6. Step-by-Step Local Setup

Follow these commands to launch the application on your computer.

### Prerequisites
- **Python 3.10+**
- **NodeJS 18+**
- **PostgreSQL** server running locally (or Dockerized).

---

### Step A: Backend Configuration

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create a local environment variables file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and verify the `DATABASE_URL`. Make sure you have a database named `ecommerce` created in PostgreSQL.
   Example:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce
   JWT_SECRET=supersecretkeyfor-ecommerce-app-2026
   ```

4. Create the python virtual environment:
   ```bash
   python3 -m venv venv
   ```

5. Activate the virtual environment:
   - **Mac/Linux**: `source venv/bin/activate`
   - **Windows**: `venv\Scripts\activate`

6. Upgrade pip and install package requirements:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

7. Run the seed script. This automatically creates all database tables and populates them with initial categories, product configurations, and a default admin user:
   ```bash
   python -m app.seed
   ```
   *Expected output: "Seeding completed successfully!"*

8. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be running at `http://localhost:8000`. You can visit `http://localhost:8000/docs` to view the interactive Swagger documentation.

---

### Step B: Frontend Configuration

1. Open a new terminal tab and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Create the frontend environment variables file:
   ```bash
   cp .env.example .env
   ```

3. Install Node modules:
   ```bash
   npm install
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The client application will launch at `http://localhost:5173`.

---

### Step C: Logging In and Testing

The seed script initializes two accounts you can use immediately:

#### 1. Admin Account
- **Email**: `admin@ecommerce.com`
- **Password**: `adminpassword123`
- **Actions**: Visit `http://localhost:5173/admin/login` directly to authenticate your admin session and access the Dashboard (where you can manage products, upload files, and update orders).

#### 2. Customer Account
- Register a new account via the frontend `/register` route. You can add items to your cart, check out, and track order histories.
