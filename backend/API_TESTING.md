# API Testing Guide

Panduan untuk testing Finance Tracker API menggunakan curl atau tools lain seperti Postman/Thunder Client.

## Base URL
```
http://localhost:5000
```

## 1. Health Check

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Finance Tracker API is running"
}
```

---

## 2. Register User

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-12-24T12:00:00.000Z"
  }
}
```

---

## 3. Login User

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Simpan token untuk request selanjutnya!**

---

## 4. Create Transaction

**Income:**
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "income",
    "amount": 5000000,
    "category": "Salary",
    "description": "Monthly salary December",
    "date": "2025-12-24"
  }'
```

**Expense:**
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "expense",
    "amount": 500000,
    "category": "Food",
    "description": "Groceries for the week"
  }'
```

**Saving:**
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "saving",
    "amount": 1000000,
    "category": "Emergency Fund",
    "description": "Monthly savings"
  }'
```

**Response (201):**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "type": "income",
    "amount": 5000000,
    "category": "Salary",
    "description": "Monthly salary December",
    "date": "2025-12-24T00:00:00.000Z",
    "createdAt": "2025-12-24T12:00:00.000Z",
    "updatedAt": "2025-12-24T12:00:00.000Z"
  }
}
```

---

## 5. Get All Transactions

**Get all:**
```bash
curl http://localhost:5000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by type:**
```bash
curl "http://localhost:5000/transactions?type=income" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by category:**
```bash
curl "http://localhost:5000/transactions?category=Food" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by date range:**
```bash
curl "http://localhost:5000/transactions?startDate=2025-12-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Multiple filters:**
```bash
curl "http://localhost:5000/transactions?type=expense&category=Food&startDate=2025-12-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid-1",
      "userId": "user-uuid",
      "type": "income",
      "amount": 5000000,
      "category": "Salary",
      "description": "Monthly salary",
      "date": "2025-12-24T00:00:00.000Z",
      "createdAt": "2025-12-24T12:00:00.000Z",
      "updatedAt": "2025-12-24T12:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "userId": "user-uuid",
      "type": "expense",
      "amount": 500000,
      "category": "Food",
      "description": "Groceries",
      "date": "2025-12-24T00:00:00.000Z",
      "createdAt": "2025-12-24T12:00:00.000Z",
      "updatedAt": "2025-12-24T12:00:00.000Z"
    }
  ],
  "summary": {
    "totalIncome": 5000000,
    "totalExpense": 500000,
    "totalSaving": 1000000,
    "balance": 3500000
  }
}
```

---

## 6. Update Transaction

```bash
curl -X PUT http://localhost:5000/transactions/TRANSACTION_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 5500000,
    "description": "Monthly salary + bonus"
  }'
```

**Response (200):**
```json
{
  "message": "Transaction updated successfully",
  "transaction": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "type": "income",
    "amount": 5500000,
    "category": "Salary",
    "description": "Monthly salary + bonus",
    "date": "2025-12-24T00:00:00.000Z",
    "createdAt": "2025-12-24T12:00:00.000Z",
    "updatedAt": "2025-12-24T12:30:00.000Z"
  }
}
```

---

## 7. Delete Transaction

```bash
curl -X DELETE http://localhost:5000/transactions/TRANSACTION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response (200):**
```json
{
  "message": "Transaction deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

```json
{
  "error": "Invalid token"
}
```

```json
{
  "error": "Token expired"
}
```

### 404 Not Found
```json
{
  "error": "Transaction not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## Quick Test Script

Simpan script berikut sebagai `test.sh` dan jalankan dengan `bash test.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "=== Testing Finance Tracker API ==="
echo ""

# 1. Health Check
echo "1. Health Check"
curl -s $BASE_URL/health | jq .
echo ""

# 2. Register
echo "2. Register User"
curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }' | jq .
echo ""

# 3. Login
echo "3. Login User"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }')
echo $LOGIN_RESPONSE | jq .

TOKEN=$(echo $LOGIN_RESPONSE | jq -r .token)
echo "Token: $TOKEN"
echo ""

# 4. Create Income
echo "4. Create Income Transaction"
INCOME_RESPONSE=$(curl -s -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "income",
    "amount": 5000000,
    "category": "Salary",
    "description": "Monthly salary"
  }')
echo $INCOME_RESPONSE | jq .
INCOME_ID=$(echo $INCOME_RESPONSE | jq -r .transaction.id)
echo ""

# 5. Create Expense
echo "5. Create Expense Transaction"
curl -s -X POST $BASE_URL/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "expense",
    "amount": 500000,
    "category": "Food",
    "description": "Groceries"
  }' | jq .
echo ""

# 6. Get All Transactions
echo "6. Get All Transactions"
curl -s $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 7. Update Transaction
echo "7. Update Transaction"
curl -s -X PUT $BASE_URL/transactions/$INCOME_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 5500000,
    "description": "Monthly salary + bonus"
  }' | jq .
echo ""

# 8. Get Transactions After Update
echo "8. Get Transactions After Update"
curl -s $BASE_URL/transactions \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

echo "=== Test Complete ==="
```

**Catatan:** Script di atas memerlukan `jq` untuk format JSON. Install dengan:
```bash
sudo apt install jq  # Ubuntu/Debian
```

Atau hapus ` | jq .` jika tidak ingin menginstall jq.
