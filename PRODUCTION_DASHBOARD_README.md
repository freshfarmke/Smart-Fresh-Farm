# Production Dashboard Implementation Guide

## Overview

The Production Dashboard is a fully functional bakery management system built with Next.js, React, Supabase, and Tailwind CSS. It enables production teams to create, track, and manage product batches with real-time status updates.

---

## 📁 Project Structure

```
frontend/src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout wrapper
│   │   └── production/
│   │       ├── page.tsx            # Production dashboard overview
│   │       ├── new-batch/
│   │       │   └── page.tsx        # Create new batch
│   │       └── [id]/
│   │           └── page.tsx        # Batch details & management
│   ├── (auth)/                     # Authentication pages (kept but not in use for production role)
│   └── (public)/
├── components/
│   ├── forms/
│   │   ├── LoginForm.tsx           # Supabase Auth login
│   │   └── RegisterForm.tsx        # Supabase Auth registration
│   └── ui/                         # Reusable UI components
├── lib/
│   ├── api.ts                      # API client utilities
│   ├── auth.ts                     # Auth helpers
│   ├── supabase/
│   │   └── client.ts              # Supabase client initialization
│   └── constants.ts               # App constants
└── types/
    └── database.ts                # Database type definitions
```

---

## 🗄️ Database Schema

### Key Tables

#### Users
- `id` (UUID) - Supabase Auth UID
- `email` (VARCHAR)
- `name` (VARCHAR)
- `role` (VARCHAR) - admin, production, finance
- `avatar_url` (TEXT)
- `created_at`, `updated_at` (TIMESTAMP)

#### Batches
- `id` (UUID) - Primary key
- `batch_number` (VARCHAR UNIQUE) - Format: BAT-YYYYMMDD-XXX
- `batch_date` (DATE)
- `status` (VARCHAR) - pending, in_progress, completed, dispatched
- `total_quantity` (INT) - Number of different products
- `total_units` (INT) - Total unit count across all products
- `notes` (TEXT)
- `created_by` (UUID) - References users.id
- `created_at`, `updated_at` (TIMESTAMP)
- `completed_at`, `dispatched_at` (TIMESTAMP)

#### Products
- `id` (UUID)
- `name` (VARCHAR)
- `description` (TEXT)
- `unit_type` (VARCHAR) - loaves, pieces, etc.
- `unit_cost` (DECIMAL)
- `created_by` (UUID)

#### Batch Products
- `id` (UUID)
- `batch_id` (UUID) - References batches.id
- `product_id` (UUID) - References products.id
- `quantity_planned` (INT)
- `quantity_produced` (INT)
- `quantity_dispatched` (INT)
- `quantity_returned` (INT)
- UNIQUE constraint on (batch_id, product_id)

#### Dispatch Logs
- `id` (UUID)
- `batch_id` (UUID)
- `route_id` (UUID)
- `institution_id` (UUID)
- `quantity_dispatched` (INT)
- `dispatch_date` (TIMESTAMP)
- `dispatched_by` (UUID)

#### Return Logs
- `id` (UUID)
- `dispatch_id` (UUID)
- `batch_id` (UUID)
- `quantity_returned` (INT)
- `return_reason` (VARCHAR)
- `condition` (VARCHAR) - good, damaged, expired, other
- `returned_by` (UUID)

#### Activity Logs
- `id` (UUID)
- `user_id` (UUID)
- `action` (VARCHAR)
- `action_type` (VARCHAR)
- `resource_type` (VARCHAR)
- `resource_id` (UUID)
- `metadata` (JSONB)

#### Routes
- `id` (UUID)
- `route_name` (VARCHAR)
- `route_code` (VARCHAR UNIQUE)
- `description` (TEXT)
- `status` (VARCHAR) - active, inactive

#### Institutions
- `id` (UUID)
- `name` (VARCHAR)
- `code` (VARCHAR UNIQUE)
- `institution_type` (VARCHAR)
- `contact_person` (VARCHAR)
- `contact_email` (VARCHAR)
- `contact_phone` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `status` (VARCHAR) - active, inactive

---

## 🚀 Setup Instructions

### 1. **Deploy SQL Schema to Supabase**

Copy the entire content of `SUPABASE_SCHEMA.sql` and execute it in your Supabase SQL Editor:

1. Go to Supabase Dashboard → Your Project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the entire SQL content from `SUPABASE_SCHEMA.sql`
5. Click **Run**

This will:
- Create all necessary tables
- Set up proper indexes for performance
- Configure Row Level Security (RLS) policies
- Seed sample products and routes

### 2. **Update Environment Variables**

Ensure your `.env.local` in the frontend has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. **Enable Required Authentication**

In Supabase Dashboard → Authentication → Settings:
- ✅ Email signup: **Disabled** (only admins create users)
- ✅ Email confirmation: **Enabled**

---

## 📋 Features Implemented

### Production Dashboard (`/production`)
- ✅ Real-time batch listing
- ✅ Stats cards showing:
  - Today's batches count
  - In-progress batches
  - Completed batches
  - Dispatched today count
- ✅ Tabbed view: Overview, In Progress, Completed
- ✅ Batch table with status indicators
- ✅ Create new batch button

### New Batch (`/production/new-batch`)
- ✅ Auto-generated batch number (BAT-YYYYMMDD-XXX)
- ✅ Date picker (defaults to today)
- ✅ Add multiple products with quantities
- ✅ Remove products from batch
- ✅ Notes field for special instructions
- ✅ Form validation
- ✅ Database insertion with transaction-like behavior

### Batch Details (`/production/[id]`)
- ✅ View complete batch information
- ✅ Display all products in batch
- ✅ Track quantities: planned, produced, dispatched, returned
- ✅ Status management (pending → in_progress → completed → dispatched)
- ✅ Status update modal with confirmation
- ✅ View batch notes
- ✅ Creator and timestamp information

---

## 🔐 Security & Permissions

### Row Level Security (RLS) Policies

All tables have RLS enabled:

**Production Team Access:**
- Can view all batches
- Can create new batches
- Can update batch status
- Can manage batch products

**Finance Team Access:**
- Can view batches for financial tracking
- Can view dispatch and return logs

**Admin Access:**
- Full access to all data
- Can manage users, routes, institutions
- Can create products

---

## 🛠️ API Integration

The dashboard uses Supabase client directly (no custom backend needed for production operations):

```typescript
// Fetch today's batches
const { data } = await supabase
  .from('batches')
  .select('...')
  .gte('batch_date', today);

// Create new batch
const { data: batch } = await supabase
  .from('batches')
  .insert({ ... })
  .select();

// Add products to batch
await supabase
  .from('batch_products')
  .insert([...]);

// Update batch status
await supabase
  .from('batches')
  .update({ status: 'in_progress' })
  .eq('id', batchId);
```

---

## 📊 Data Flow

```
1. User logs in with Supabase Auth
   ↓
2. Role is checked (must be 'production' or 'admin')
   ↓
3. Redirected to /production dashboard
   ↓
4. Fetches today's batches from Supabase
   ↓
5. Displays stats and batch list
   ↓
6. User can click "New Batch" → /production/new-batch
   ↓
7. Create batch form inserts to:
   - batches table
   - batch_products table
   ↓
8. Redirects to batch details page
   ↓
9. User can update batch status through modal
   ↓
10. Status update reflected in real-time
```

---

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Login with production account
- [ ] Verify redirect to `/production` dashboard
- [ ] Check role-based access control

### Batch Management
- [ ] Create new batch
- [ ] Verify batch number is auto-generated
- [ ] Add multiple products to batch
- [ ] Remove product from batch
- [ ] Submit batch creation
- [ ] Verify data appears in database

### Batch Details
- [ ] View batch details
- [ ] Check all product quantities display
- [ ] Update batch status
- [ ] Verify status change in database
- [ ] View activity in Supabase

### UI/UX
- [ ] Responsive design on mobile
- [ ] Loading states display correctly
- [ ] Error messages show appropriately
- [ ] Navigation works smoothly

---

## 🔄 Future Enhancements

The schema supports these upcoming features:

1. **Dispatch Management**
   - Log batch dispatch to routes and institutions
   - Track delivery quantities
   - Multiple dispatch logs per batch

2. **Return Management**
   - Record returns with condition assessment
   - Link returns to dispatch logs
   - Generate return reasons report

3. **Activity Tracking**
   - Automatic logging of all major actions
   - User activity audit trail
   - Batch timeline view

4. **Finance Integration**
   - Cost tracking per batch
   - Profitability analysis
   - Expense management

5. **Advanced Reporting**
   - Production trends
   - Dispatch efficiency
   - Returns analysis
   - Team productivity

---

## 📞 Support

For issues or questions:
1. Check Supabase logs for SQL errors
2. Verify RLS policies are configured correctly
3. Check browser console for JavaScript errors
4. Ensure all environment variables are set
5. Verify user has correct role in users table

---

## 📝 Notes

- All timestamps are in UTC with timezone
- Batch numbers are unique and auto-generated
- Batch dates can be set to any date, not just today
- Status flow is enforced: pending → in_progress → completed → dispatched
- Products can only be added once per batch (UNIQUE constraint)
- Deleting a batch cascades to batch_products and dispatch logs

---

**Last Updated:** February 20, 2026
**Tech Stack:** Next.js 15, React 18, Supabase, Tailwind CSS, TypeScript
