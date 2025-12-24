# Finance Tracker Backend API

Backend API untuk aplikasi Finance Tracker dengan fitur autentikasi dan manajemen transaksi keuangan.

## Features

✅ Register & Login dengan JWT Authentication  
✅ CRUD Transactions (Income, Expense, Saving)  
✅ Filter transaksi berdasarkan type, category, dan date range  
✅ Auto-calculate summary (total income, expense, saving, balance)  
✅ Stateless API dengan JWT  
✅ User isolation (setiap user hanya bisa lihat transaksi sendiri)

## Tech Stack

- **Node.js** + **Express.js**
- **Prisma ORM** dengan **PostgreSQL**
- **JWT** untuk authentication
- **Bcrypt** untuk password hashing

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` ke `.env` dan sesuaikan:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio untuk melihat database
npx prisma studio
```

### 4. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Transactions (Requires Authentication)

Semua endpoint transaction memerlukan header:
```
Authorization: Bearer <your-jwt-token>
```

#### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "income",
  "amount": 5000000,
  "category": "Salary",
  "description": "Monthly salary",
  "date": "2025-12-24"
}
```

**Type**: `income` | `expense` | `saving`

#### Get All Transactions
```http
GET /transactions
Authorization: Bearer <token>

# Optional query parameters:
GET /transactions?type=income
GET /transactions?category=Food
GET /transactions?startDate=2025-12-01&endDate=2025-12-31
```

Response:
```json
{
  "transactions": [...],
  "summary": {
    "totalIncome": 5000000,
    "totalExpense": 2000000,
    "totalSaving": 1000000,
    "balance": 2000000
  }
}
```

#### Update Transaction
```http
PUT /transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5500000,
  "category": "Salary",
  "description": "Monthly salary + bonus"
}
```

#### Delete Transaction
```http
DELETE /transactions/:id
Authorization: Bearer <token>
```

### Health Check
```http
GET /health
```

## Database Schema

### User
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `name`: String
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Transaction
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key)
- `type`: String (income/expense/saving)
- `amount`: Float
- `category`: String
- `description`: String (Optional)
- `date`: DateTime
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Security Features

- Password hashing dengan bcrypt (10 rounds)
- JWT token dengan expiry 7 hari
- Middleware autentikasi untuk protected routes
- User isolation (users hanya bisa akses data mereka sendiri)
- Input validation untuk semua endpoints

## Error Handling

API mengembalikan error dalam format:
```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# View database with Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Format Prisma schema
npx prisma format
```