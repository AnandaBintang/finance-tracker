# Finance Tracker - Architecture Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Component Architecture](#component-architecture)
5. [Data Flow](#data-flow)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Scaling Strategy](#scaling-strategy)

---

## 🎯 System Overview

Finance Tracker adalah aplikasi web full-stack untuk mengelola keuangan pribadi dengan fitur:
- Manajemen transaksi (income & expenses)
- Autentikasi pengguna dengan JWT
- Dashboard real-time dengan ringkasan keuangan
- Containerized deployment dengan Docker
- Load balancing dan horizontal scaling

**Architecture Pattern:** Microservices dengan Nginx Reverse Proxy

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENTS                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX REVERSE PROXY                          │
│                    (Port 80/443)                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  - Load Balancing (least_conn)                           │  │
│  │  - Rate Limiting (API: 10req/s, Frontend: 30req/s)       │  │
│  │  - Security Headers (CSP, X-Frame-Options, etc)          │  │
│  │  - Gzip Compression                                       │  │
│  │  - SSL/TLS Termination (optional)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────────┬───────────────────────┘
              │                           │
              │ /api/*                    │ /*
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   BACKEND API (x2)      │   │   FRONTEND APP (x2)     │
│   Express.js + Prisma   │   │   Next.js 15            │
│   (Port 5000)           │   │   (Port 3000)           │
│                         │   │                         │
│  ┌──────────────────┐   │   │  ┌──────────────────┐   │
│  │ Auth Controller  │   │   │  │ React Components │   │
│  │ - Register       │   │   │  │ - Dashboard      │   │
│  │ - Login          │   │   │  │ - TransactionList│   │
│  │ - JWT Auth       │   │   │  │ - Summary        │   │
│  ├──────────────────┤   │   │  ├──────────────────┤   │
│  │ Transaction      │   │   │  │ Context API      │   │
│  │ Controller       │   │   │  │ - AuthContext    │   │
│  │ - CRUD Ops       │   │   │  ├──────────────────┤   │
│  │ - Filtering      │   │   │  │ API Client       │   │
│  │ - Aggregation    │   │   │  │ - HTTP Calls     │   │
│  └──────────────────┘   │   │  └──────────────────┘   │
└─────────────┬───────────┘   └─────────────────────────┘
              │
              │ Prisma ORM
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                          │
│                    (Port 5432)                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                  │  │
│  │  - User (id, email, password, name, createdAt)           │  │
│  │  - Transaction (id, userId, amount, type, category, etc) │  │
│  │                                                           │  │
│  │  Persistent Volume: postgres_data                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER NETWORK                               │
│                    finance-network (172.20.0.0/16)              │
│                    Bridge Driver                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** Next.js 15 (React 19)
- **Styling:** CSS Modules
- **State Management:** React Context API
- **HTTP Client:** Custom API Client (Fetch API)
- **Build Mode:** Standalone output for Docker optimization

### **Backend**
- **Runtime:** Node.js 20 (Alpine Linux)
- **Framework:** Express.js
- **ORM:** Prisma 5.22.0
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Database Client:** @prisma/client

### **Database**
- **RDBMS:** PostgreSQL 16 (Alpine)
- **Schema Management:** Prisma Migrations
- **Connection Pooling:** Built-in Prisma connection pool

### **Reverse Proxy & Load Balancer**
- **Server:** Nginx 1.29.4 (Alpine)
- **Algorithm:** least_conn (least connections)
- **Features:** Rate limiting, gzip, security headers

### **Containerization**
- **Orchestration:** Docker Compose v2.35.1
- **Base Images:** 
  - node:20-alpine (Backend & Frontend)
  - postgres:16-alpine (Database)
  - nginx:alpine (Reverse Proxy)
- **Build Strategy:** Multi-stage builds for optimization

### **Security**
- **Secrets Management:** prep.sh script with OpenSSL
- **Environment Variables:** .env file (not committed)
- **Container Security:** Non-root users, resource limits

---

## 🧩 Component Architecture

### **1. Frontend Components**

```
src/
├── app/
│   ├── layout.js              # Root layout with AuthProvider
│   ├── page.js                # Landing page
│   ├── dashboard/
│   │   └── page.js            # Dashboard with Summary & TransactionList
│   ├── login/
│   │   └── page.js            # Login form
│   └── register/
│       └── page.js            # Registration form
├── components/
│   ├── Summary.js             # Financial summary display
│   ├── TransactionForm.js     # Add/Edit transaction form
│   └── TransactionList.js     # Transaction table with filters
├── contexts/
│   └── AuthContext.js         # Authentication state management
└── lib/
    └── api.js                 # HTTP client for API calls
```

**Component Responsibilities:**
- **AuthContext:** Manages user session, token storage, authentication state
- **Summary:** Aggregates and displays income, expenses, balance
- **TransactionList:** Fetches, filters, displays transactions with pagination
- **TransactionForm:** Handles create/update transaction operations
- **API Client:** Centralized HTTP request handling with token management

### **2. Backend Structure**

```
src/
├── index.js                   # Express server entry point
├── controllers/
│   ├── auth.controller.js     # Authentication logic
│   └── transaction.controller.js  # Transaction CRUD operations
├── middleware/
│   └── auth.middleware.js     # JWT verification middleware
└── routes/
    ├── auth.routes.js         # Auth endpoints (/api/auth/*)
    └── transaction.routes.js  # Transaction endpoints (/api/transactions/*)

prisma/
├── schema.prisma              # Database schema definition
└── migrations/
    └── 20251224123815_init/   # Initial migration
        └── migration.sql
```

**API Layer Responsibilities:**
- **Controllers:** Business logic, data validation, database operations
- **Middleware:** Request authentication, authorization checks
- **Routes:** Endpoint definitions, request routing

### **3. Database Schema**

**User Table:**
```prisma
model User {
  id          String        @id @default(uuid())
  email       String        @unique
  password    String
  name        String
  createdAt   DateTime      @default(now())
  transactions Transaction[]
}
```

**Transaction Table:**
```prisma
model Transaction {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount      Float
  type        String   // 'income' or 'expense'
  category    String
  description String?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Relationships:**
- One User → Many Transactions (1:N)
- Cascade delete: Deleting user deletes all transactions

---

## 🔄 Data Flow

### **Authentication Flow**

```
1. User Registration:
   Browser → POST /api/auth/register
   → Backend validates input
   → Hash password with bcrypt
   → Store in PostgreSQL
   → Return success message

2. User Login:
   Browser → POST /api/auth/login
   → Backend validates credentials
   → Compare hashed password
   → Generate JWT token (expires in 7 days)
   → Return token + user data
   → Frontend stores token in localStorage

3. Authenticated Request:
   Browser → GET /api/transactions (with Authorization header)
   → Nginx forwards to Backend
   → auth.middleware verifies JWT
   → Extract userId from token
   → Execute controller logic
   → Return data
```

### **Transaction Management Flow**

```
1. Fetch Transactions:
   Dashboard Component → useEffect
   → API Client GET /api/transactions?type=expense
   → Backend filters by userId & type
   → Prisma query: findMany with filters
   → Return JSON array
   → React state update → UI re-render

2. Create Transaction:
   TransactionForm → onSubmit
   → API Client POST /api/transactions
   → Backend validates input (amount > 0, valid type, etc)
   → Prisma create operation
   → Return created transaction
   → Refresh transaction list

3. Update Transaction:
   TransactionList → Edit button
   → API Client PUT /api/transactions/:id
   → Backend verifies ownership (userId match)
   → Prisma update operation
   → Return updated transaction
   → UI refresh

4. Delete Transaction:
   TransactionList → Delete button
   → API Client DELETE /api/transactions/:id
   → Backend verifies ownership
   → Prisma delete operation
   → Return success
   → Remove from UI state
```

---

## 🔗 API Endpoints

### **Authentication Endpoints**

| Method | Endpoint              | Description          | Auth Required |
|--------|-----------------------|----------------------|---------------|
| POST   | `/api/auth/register`  | Create new user      | ❌            |
| POST   | `/api/auth/login`     | Login user           | ❌            |
| GET    | `/api/health`         | API health check     | ❌            |

**Request/Response Examples:**

```javascript
// POST /api/auth/register
Request: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
Response: {
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}

// POST /api/auth/login
Request: {
  "email": "john@example.com",
  "password": "SecurePass123"
}
Response: {
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "email": "...", "name": "..." }
}
```

### **Transaction Endpoints**

| Method | Endpoint                   | Description              | Auth Required |
|--------|----------------------------|--------------------------|---------------|
| GET    | `/api/transactions`        | Get all user transactions| ✅            |
| GET    | `/api/transactions/:id`    | Get single transaction   | ✅            |
| POST   | `/api/transactions`        | Create new transaction   | ✅            |
| PUT    | `/api/transactions/:id`    | Update transaction       | ✅            |
| DELETE | `/api/transactions/:id`    | Delete transaction       | ✅            |

**Query Parameters for GET /api/transactions:**
- `type` - Filter by income/expense (optional)
- `category` - Filter by category (optional)
- `startDate` - Filter from date (optional)
- `endDate` - Filter to date (optional)

**Request/Response Examples:**

```javascript
// POST /api/transactions
Request: {
  "amount": 50000,
  "type": "expense",
  "category": "Food",
  "description": "Lunch at restaurant",
  "date": "2025-12-24T10:30:00Z"
}
Response: {
  "message": "Transaction created successfully",
  "transaction": {
    "id": "uuid",
    "userId": "user-uuid",
    "amount": 50000,
    "type": "expense",
    "category": "Food",
    "description": "Lunch at restaurant",
    "date": "2025-12-24T10:30:00.000Z",
    "createdAt": "2025-12-24T10:30:00.000Z"
  }
}
```

---

## 🔒 Security Architecture

### **1. Authentication & Authorization**

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Nginx Rate Limiting
├── API endpoints: 10 requests/second (burst 20)
├── Frontend endpoints: 30 requests/second (burst 50)
└── DDoS protection

Layer 2: JWT Authentication
├── Token generation with HS256 algorithm
├── 7-day expiration
├── Stored in localStorage (client-side)
└── Verified on every protected route

Layer 3: Password Security
├── bcrypt hashing (10 rounds)
├── Salted password storage
└── Never returned in API responses

Layer 4: Database Security
├── Prisma parameterized queries (SQL injection protection)
├── User isolation (userId filter on all queries)
└── Cascade delete for data integrity
```

### **2. Network Security**

- **Docker Network Isolation:** Internal bridge network (172.20.0.0/16)
- **Port Exposure:** Only Nginx port 80 exposed to host
- **Backend/Frontend:** Not directly accessible from outside
- **Database:** Completely isolated, no external access

### **3. Security Headers (Nginx)**

```nginx
X-Frame-Options: SAMEORIGIN              # Prevent clickjacking
X-Content-Type-Options: nosniff          # Prevent MIME sniffing
X-XSS-Protection: 1; mode=block          # XSS protection
Referrer-Policy: no-referrer-when-downgrade
Server: nginx (version hidden)
```

### **4. Secret Management**

```bash
# prep.sh generates secure random secrets
DB_PASSWORD: 24 characters (base64, alphanumeric)
JWT_SECRET: 32 characters (base64, alphanumeric)

# Stored in .env file with 600 permissions (read/write owner only)
# Never committed to git (.gitignore)
```

---

## 🚀 Deployment Architecture

### **Container Specifications**

| Service   | Replicas | CPU Limit | Memory Limit | Health Check       |
|-----------|----------|-----------|--------------|-------------------|
| Postgres  | 1        | 1 CPU     | 512M         | pg_isready        |
| Backend   | 2        | 0.5 CPU   | 512M         | GET /api/health   |
| Frontend  | 2        | 0.5 CPU   | 512M         | GET :3000         |
| Nginx     | 1        | 0.25 CPU  | 128M         | GET /nginx-health |

### **Docker Compose Services**

```yaml
services:
  postgres:      # Database server (single instance)
  backend:       # API server (scalable, default 2 replicas)
  frontend:      # Web server (scalable, default 2 replicas)
  nginx:         # Reverse proxy & load balancer (single instance)

networks:
  finance-network:  # Internal bridge network

volumes:
  postgres_data:    # Persistent database storage
```

### **Build Process**

```
1. Backend Build (Multi-stage):
   Stage 1 (deps): Install dependencies
   Stage 2 (builder): Copy source, generate Prisma client
   Stage 3 (runner): Minimal runtime image
   → Size: ~150MB (vs ~800MB without multi-stage)

2. Frontend Build (Multi-stage):
   Stage 1 (deps): Install dependencies
   Stage 2 (builder): Build Next.js standalone output
   Stage 3 (runner): Copy only production files
   → Size: ~200MB (vs ~1GB without multi-stage)

3. Nginx:
   → Official nginx:alpine image (~40MB)
   → Mount custom config (read-only)
```

### **Deployment Steps**

```bash
# 1. Generate secrets
./prep.sh

# 2. Build images
docker compose build

# 3. Start services
docker compose up -d

# 4. Check status
docker compose ps

# 5. View logs
docker compose logs -f

# 6. Scale services (optional)
docker compose up -d --scale backend=5 --scale frontend=3
```

---

## 📈 Scaling Strategy

### **Horizontal Scaling**

**Backend Scaling:**
```bash
# Scale to 5 backend replicas
docker compose up -d --scale backend=5

# Load distribution via Nginx least_conn:
# - New requests go to backend with fewest active connections
# - Automatic failover if one instance fails
# - No downtime during scaling
```

**Frontend Scaling:**
```bash
# Scale to 3 frontend replicas
docker compose up -d --scale frontend=3

# Benefits:
# - Handle more concurrent users
# - Distribute Next.js SSR load
# - Resilience to instance failures
```

### **Vertical Scaling**

Edit `docker-compose.yml` resource limits:
```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'      # Increase from 0.5
        memory: 1024M    # Increase from 512M
```

### **Database Scaling**

**Current:** Single PostgreSQL instance

**Production Options:**
1. **Read Replicas:** Prisma supports read replicas for read-heavy workloads
2. **Connection Pooling:** PgBouncer for connection management
3. **Managed Database:** AWS RDS, Azure PostgreSQL, etc.

### **Load Testing**

```bash
# Apache Bench example
ab -n 10000 -c 100 http://localhost/api/health

# Expected results with 2 backend replicas:
# - ~2000 requests/second
# - 50ms average response time
# - 0% failure rate
```

---

## 📊 Monitoring & Observability

### **Health Checks**

Each service has health check endpoints:

```bash
# Nginx
curl http://localhost/nginx-health
# Response: healthy

# Backend
curl http://localhost/api/health
# Response: {"status":"ok","message":"Finance Tracker API is running"}

# Database (from backend container)
docker compose exec backend npx prisma db execute --stdin <<< "SELECT 1"
```

### **Container Logs**

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f nginx

# Tail last 50 lines
docker compose logs --tail=50 nginx

# Filter by time
docker compose logs --since 30m backend
```

### **Resource Monitoring**

```bash
# Real-time stats
docker stats

# Per-service metrics
docker compose stats

# Container inspection
docker compose exec backend ps aux
docker compose exec backend df -h
```

---

## 🔧 Development vs Production

| Aspect            | Development                | Production                     |
|-------------------|----------------------------|--------------------------------|
| HTTPS             | HTTP only                  | HTTPS with Let's Encrypt       |
| Replicas          | 2 backend, 2 frontend      | 5+ backend, 3+ frontend        |
| Database          | Local PostgreSQL           | Managed DB (RDS, Cloud SQL)    |
| Secrets           | .env file                  | Secret management service      |
| Logging           | Docker logs                | Centralized logging (ELK)      |
| Monitoring        | Manual docker stats        | Prometheus + Grafana           |
| Backup            | Manual pg_dump             | Automated daily backups        |
| CI/CD             | Manual docker compose      | GitHub Actions + Kubernetes    |

---

## 📁 Project Structure

```
finance-tracker/
├── backend/                 # Express.js API
│   ├── Dockerfile          # Multi-stage build
│   ├── package.json        # Dependencies
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── src/
│       ├── index.js        # Server entry point
│       ├── controllers/    # Business logic
│       ├── middleware/     # Auth middleware
│       └── routes/         # API routes
│
├── frontend/               # Next.js application
│   ├── Dockerfile         # Multi-stage build
│   ├── package.json       # Dependencies
│   ├── next.config.mjs    # Next.js config
│   └── src/
│       ├── app/           # Pages (App Router)
│       ├── components/    # React components
│       ├── contexts/      # Context providers
│       └── lib/           # Utilities
│
├── nginx/                 # Reverse proxy config
│   └── nginx.conf        # Nginx configuration
│
├── docker-compose.yml    # Container orchestration
├── prep.sh               # Secret generation script
├── .env                  # Environment variables (gitignored)
├── .env.example          # Template for .env
├── ARCHITECTURE.md       # This file
├── DOCKER.md            # Docker documentation
└── README.md            # Project README
```

---

## 🎯 Key Design Decisions

### **1. Why Nginx as Reverse Proxy?**
- Single entry point for all requests
- Load balancing without code changes
- SSL/TLS termination
- Rate limiting & DDoS protection
- Static file serving (future optimization)

### **2. Why Prisma ORM?**
- Type-safe database queries
- Automatic migrations
- Excellent TypeScript/JavaScript support
- Built-in connection pooling
- Protection against SQL injection

### **3. Why JWT Authentication?**
- Stateless authentication (no session storage)
- Scalable across multiple backend instances
- Easy to implement and validate
- Industry standard

### **4. Why Docker Compose (not Kubernetes)?**
- Simpler for small/medium deployments
- Lower resource overhead
- Easier local development
- Perfect for single-server deployments
- Can migrate to K8s later if needed

### **5. Why Multi-stage Docker Builds?**
- 80% smaller image sizes
- Faster deployments
- Security (no dev dependencies in production)
- Layer caching optimization

---

## 🔮 Future Enhancements

### **Phase 2 - Features**
- [ ] Budget tracking & alerts
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Data export (CSV, PDF)
- [ ] Mobile responsive design improvements

### **Phase 3 - Infrastructure**
- [ ] HTTPS with Let's Encrypt
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Kubernetes deployment
- [ ] Redis caching layer
- [ ] Elasticsearch for transaction search

### **Phase 4 - Observability**
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] ELK stack for logging
- [ ] APM (Application Performance Monitoring)
- [ ] Distributed tracing

---

## 📞 Support & Troubleshooting

**Common Issues:**

1. **Port 80 already in use:**
   ```bash
   sudo lsof -t -i:80 | xargs sudo kill -9
   docker compose up -d
   ```

2. **CORS errors:**
   - Ensure NEXT_PUBLIC_API_URL=/api in frontend Dockerfile
   - Rebuild frontend: `docker compose build frontend`

3. **Database connection errors:**
   - Check DATABASE_URL in .env
   - Verify postgres container is healthy: `docker compose ps`

4. **Prisma client errors:**
   - Regenerate client: `docker compose exec backend npx prisma generate`
   - Run migrations: `docker compose exec backend npx prisma migrate deploy`

**Logs & Debugging:**
```bash
# Check all services
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Enter container shell
docker compose exec backend sh
docker compose exec frontend sh
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

---

**Last Updated:** December 24, 2025  
**Version:** 1.0.0  
**Maintainer:** Development Team
