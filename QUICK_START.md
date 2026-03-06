# Quick Start Guide - Production Dashboard

## 🚀 Deploy & Test in 5 Minutes

### 1. Deploy SQL Schema (1 minute)
```sql
-- Copy all content from SUPABASE_SCHEMA.sql
-- Go to: Supabase Dashboard → SQL Editor → New Query
-- Paste entire content and click "Run"
```sql
-- if you still have an old `users` table and kept the role column there:
-- **replace <USER_UUID> with a real UUID from your table**
UPDATE public.users
SET role = 'finance'
WHERE id = '<USER_UUID>';

-- with the current schema (profiles table)
-- **replace <USER_UUID> with the auth user ID (UUID) stored in profiles.user_id**
UPDATE public.profiles
SET role = 'finance'
WHERE user_id = '<USER_UUID>';
```
```

### 3. Create First Admin User (1 minute)
```bash
curl -X POST http://localhost:5000/admin/create-user \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bakery.com",
    "password": "Admin@123456",
    "role": "admin"
  }'
```

*This endpoint creates the Auth user and a corresponding profile record.*

If you prefer to run SQL yourself, insert into **profiles** rather than `users`:

```sql
-- create auth user first (supabase.auth.admin.createUser)
INSERT INTO public.profiles (user_id, email, name, role)
VALUES ('<USER_UUID>', 'admin@bakery.com', 'Admin User', 'admin');  -- use a real UUID, e.g. from auth.users table
```

### 4. Create Production User (1 minute)
Using admin API:
```bash
curl -X POST http://localhost:5000/admin/create-user \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "production@bakery.com",
    "password": "Production@123",
    "role": "production"
  }'
```

### 5. Start Application (30 seconds)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open: http://localhost:3000
```

---

## 🔗 URL Reference

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/login` | Authenticate user |
| Dashboard | `/production` | View all batches |
| New Batch | `/production/new-batch` | Create batch |
| Batch Details | `/production/{id}` | View/manage batch |

---

## 📊 Sample Data

### Seed Products
Already created in schema:
- White Bread
- Whole Wheat Bread
- Croissants
- Bagels
- Muffins
- Donuts

### Seed Routes
Already created in schema:
- North Route (NRT-001)
- South Route (SRT-002)
- East Route (ERT-003)
- West Route (WRT-004)
- Central Route (CRT-005)

---

## 🧪 Test Workflow

```
1. Login as production@bakery.com
   ↓
2. Click "New Batch" button
   ↓
3. Fill batch info (date defaults to today)
   ↓
4. Add products:
   - Select "White Bread", quantity 100 → Click "Add"
   - Select "Croissants", quantity 50 → Click "Add"
   - Select "Bagels", quantity 75 → Click "Add"
   ↓
5. Click "Create Batch"
   ↓
6. Batch created! Redirected to batch details
   ↓
7. Click "Update Status"
   ↓
8. Change from "Pending" to "In Progress"
   ↓
9. Confirm change
   ↓
10. ✅ Batch status updated in real-time!
```

---

## 🛠️ Useful SQL Queries

### View all batches today
```sql
SELECT * FROM batches 
WHERE batch_date = CURRENT_DATE
ORDER BY created_at DESC;
```

### View batch with products
```sql
SELECT 
  b.batch_number,
  b.status,
  p.name as product_name,
  bp.quantity_planned,
  bp.quantity_produced
FROM batches b
JOIN batch_products bp ON b.id = bp.batch_id
JOIN products p ON bp.product_id = p.id
WHERE b.id = 'batch-uuid-here';
```

### View user permissions
```sql
-- look at the profile table (roles are stored here)
SELECT user_id, email, name, role FROM profiles 
WHERE email = 'production@bakery.com';
```

### Disable a user
```sql
-- Change password and clear auth
UPDATE auth.users 
SET encrypted_password = '' 
WHERE email = 'user@bakery.com';
```

---

## 🔑 Key Environment Variables

| Variable | Where | Example |
|----------|-------|---------|
| NEXT_PUBLIC_SUPABASE_URL | frontend | https://csehbkbaukixywgkvfut.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | frontend | sb_publishable_xxxxx |
| NEXT_PUBLIC_API_URL | frontend | http://localhost:5000 |
| SUPABASE_SERVICE_ROLE_KEY | backend | eyJhbGciOiJIUzI1NiIs... |
| SUPABASE_URL | backend | https://csehbkbaukixywgkvfut.supabase.co |

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Can login to `/login` with production account
- [ ] Automatically redirected to `/production`
- [ ] Dashboard loads with stats cards
- [ ] Can click "New Batch" button
- [ ] Form loads with date picker and product dropdown
- [ ] Can add multiple products
- [ ] Can submit batch creation
- [ ] Batch appears in Supabase database
- [ ] Can click batch to view details
- [ ] Can update batch status
- [ ] Status change appears immediately
- [ ] Batch timeline shows all changes

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Module not found: @supabase/ssr" | Already fixed - uses @supabase/supabase-js |
| Batches not loading | Check RLS policies are enabled |
| Can't create batch | Verify products table has sample data |
| Status update fails | Check user has production role |
| Form doesn't submit | Check browser console for validation errors |
| Redirect to login | Check token in localStorage or Supabase session |

---

## 📞 API Endpoints (Backend)

```
POST /admin/create-user
  Headers: Authorization: Bearer <TOKEN>
  Body: { email, password, role }
  Response: { message, user_id }

GET /dashboard/stats
  Headers: Authorization: Bearer <TOKEN>
  Response: { todayBatches, inProgress, completed, dispatchedToday }

GET /dashboard/recent-batches
  Headers: Authorization: Bearer <TOKEN>
  Response: [ { id, batch_number, status, ... } ]
```

---

## 🎓 Learning Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hooks Docs](https://react.dev/reference/react)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📱 File Structure Quick Reference

```
code/
├── frontend/                           # Next.js app
│   ├── src/app/(dashboard)/
│   │   └── production/
│   │       ├── page.tsx               # Dashboard
│   │       ├── new-batch/page.tsx     # Create batch
│   │       └── [id]/page.tsx          # Batch details
│   ├── src/lib/
│   │   └── supabase/client.ts        # Supabase setup
│   └── package.json
├── backend/                            # Node.js backend
│   ├── src/
│   │   ├── server.js                  # Entry point
│   │   ├── supabaseAdmin.js          # Admin client
│   │   └── routes/admin.js           # Admin endpoints
│   └── package.json
├── SUPABASE_SCHEMA.sql                # Database
├── PRODUCTION_DASHBOARD_README.md     # Detailed docs
├── IMPLEMENTATION_SUMMARY.md          # What's done
└── QUICK_START.md                     # This file
```

---

**Status:** Ready to Deploy ✅
**Version:** 1.0.0
**Last Updated:** February 20, 2026
