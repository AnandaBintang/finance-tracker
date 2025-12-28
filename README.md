# 💰 Finance Tracker - Full Stack Application

Aplikasi web full-stack untuk tracking keuangan pribadi dengan fitur income, expense, dan saving management. Dibangun dengan **Next.js** (frontend) dan **Express + Prisma** (backend).

## ✨ Features

### Backend API (Express + Prisma + PostgreSQL)
- ✅ User Authentication (Register & Login with JWT)
- ✅ Password Hashing (bcrypt)
- ✅ CRUD Transactions (Create, Read, Update, Delete)
- ✅ Filter & Summary Calculations
- ✅ User Isolation (setiap user hanya akses data sendiri)
- ✅ Stateless API dengan JWT
- ✅ RESTful API design

### Frontend (Next.js 16 + React 19)
- ✅ Authentication Pages (Login & Register)
- ✅ Protected Dashboard
- ✅ Transaction Management (Add, Edit, Delete)
- ✅ Summary Cards (Income, Expense, Saving, Balance)
- ✅ Transaction Filtering
- ✅ Responsive Design (Mobile & Desktop)
- ✅ PWA Support (Progressive Web App)
- ✅ JWT Token Management
- ✅ Context API for State Management

## 🏗️ Architecture

```
finance-tracker/
├── backend/                # Express API Server
│   ├── src/
│   │   ├── index.js       # Server entry point
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Auth middleware
│   │   └── routes/        # API routes
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── .env               # Backend environment variables
│
└── frontend/              # Next.js Application
    ├── src/
    │   ├── app/           # Pages (App Router)
    │   ├── components/    # React components
    │   ├── contexts/      # Context providers
    │   └── lib/           # Utilities (API client)
    └── .env.local         # Frontend environment variables
```

## 🚀 Quick Start

### 🐳 Docker Deployment (Recommended)

The fastest way to get started with production-ready setup including load balancing and scaling:

```bash
# 1. Generate secure environment variables
./prep.sh

# 2. Start all services (Postgres, Backend x2, Frontend x2, Nginx)
docker compose up -d --build

# 3. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 4. Access application
# Open browser: http://localhost
```

**📖 For detailed Docker setup, scaling, and DevOps features, see [DOCKER.md](./DOCKER.md)**

---

### 💻 Local Development

For local development without Docker:

### Prerequisites
- Node.js 18+ 
- PostgreSQL
- npm or yarn

### 1. Clone & Install

```bash
# Clone repository
git clone <repo-url>
cd finance-tracker

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Backend

```bash
cd backend

# Copy environment example
cp .env.example .env

# Edit .env dengan database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/finance_tracker"
# JWT_SECRET="your-secret-key"
# PORT=5000

# Generate Prisma Client
npx prisma generate

# Run database migration
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend running at: **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start frontend dev server
npm run dev
```

Frontend running at: **http://localhost:3000**

## 📡 API Endpoints

### Authentication
```
POST   /auth/register        # Register new user
POST   /auth/login           # Login user
```

### Transactions (Protected - requires JWT token)
```
GET    /transactions         # Get all user transactions
POST   /transactions         # Create new transaction
PUT    /transactions/:id     # Update transaction
DELETE /transactions/:id     # Delete transaction
```

### Query Parameters (GET /transactions)
- `type` - Filter by type: income, expense, saving
- `category` - Filter by category
- `startDate` - Filter from date
- `endDate` - Filter to date

## 🗄️ Database Schema

### User Model
```prisma
model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String        # Hashed with bcrypt
  name         String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  transactions Transaction[]
}
```

### Transaction Model
```prisma
model Transaction {
  id          String   @id @default(uuid())
  userId      String
  type        String   # income, expense, saving
  amount      Float
  category    String
  description String?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
}
```

## 🧪 Testing API

### Using curl

1. **Register User**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"User"}'
```

2. **Login**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

3. **Create Transaction** (use token from login)
```bash
curl -X POST http://localhost:5000/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"type":"income","amount":5000000,"category":"Salary","description":"Monthly salary"}'
```

4. **Get Transactions**
```bash
curl http://localhost:5000/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

See `backend/API_TESTING.md` for more examples.

## 🎨 Frontend Pages

### Public Pages
- **`/`** - Landing page dengan CTA
- **`/login`** - Login form
- **`/register`** - Registration form

### Protected Pages  
- **`/dashboard`** - Main dashboard
  - Summary cards (Income, Expense, Saving, Balance)
  - Transaction list dengan filter
  - Add/Edit transaction modal
  - Delete dengan confirmation

## 🔐 Security

- Password hashing dengan **bcrypt** (10 rounds)
- JWT authentication dengan **7-day expiry**
- Protected API routes dengan middleware
- User data isolation
- Input validation
- CORS enabled

## 💻 Tech Stack

### Backend
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **CSS Modules** - Styling
- **Context API** - State management
- **Fetch API** - HTTP client

## 📱 PWA Features

- Web App Manifest
- App Icons (192x192, 512x512)
- Installable as standalone app
- Basic offline support

## 🚀 Production Deployment

### Backend
```bash
cd backend
npm install --production
npm start
```

Deploy to:
- Heroku
- Railway
- Render
- DigitalOcean

### Frontend
```bash
cd frontend
npm run build
npm start
```

Deploy to:
- **Vercel** (recommended for Next.js)
- Netlify
- CloudFlare Pages

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
PORT=5000
NODE_ENV=production
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## 📊 Database Management

### Prisma Studio (GUI)
```bash
cd backend
npx prisma studio
```

### Reset Database
```bash
npx prisma migrate reset
```

### Create New Migration
```bash
npx prisma migrate dev --name migration_name
```

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
- Check PostgreSQL service running: `sudo systemctl status postgresql`
- Check DATABASE_URL di `.env`
- Create database: `createdb finance_tracker`

### Frontend "Failed to fetch"
- Pastikan backend running di port 5000
- Check NEXT_PUBLIC_API_URL di `.env.local`
- Check CORS di backend

### Token expired 401 error
- Token valid selama 7 hari
- Logout dan login ulang untuk refresh token

## 📝 Development Workflow

1. **Backend**: Make changes → Server auto-reload (nodemon)
2. **Frontend**: Save file → Fast Refresh (Next.js)
3. **Database**: Update schema → Run `prisma migrate dev`
4. **Test**: Use API_TESTING.md atau Postman/Thunder Client

## 🎓 Learning Resources

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [Next.js](https://nextjs.org/docs)
- [JWT](https://jwt.io/)
- [PostgreSQL](https://www.postgresql.org/docs/)

## 👥 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit Pull Request

## 📄 License

ISC

## 📞 Support

For issues and questions:
- Check documentation di `backend/README.md` dan `frontend/README.md`
- See API examples di `backend/API_TESTING.md`
- Review code comments

---
