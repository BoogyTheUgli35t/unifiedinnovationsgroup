
# UIG Platform - Complete Implementation Plan

## Overview
Building the complete authenticated experience for Unified Innovations Group:
1. **User Dashboard** - Personal financial command center
2. **Admin Portal** (CRITICAL) - First-class institutional management system  
3. **Contact Form Email** - Backend integration via edge function

---

## Phase 1: Database Architecture

### Core Tables

**1. profiles** - User profile data
- `id` (uuid, FK to auth.users)
- `email`, `full_name`, `phone`, `avatar_url`
- `account_status` (active, frozen, pending_verification, suspended)
- `kyc_status` (not_started, pending, approved, rejected)
- `created_at`, `updated_at`

**2. user_roles** - Role management (separate table for security)
- `id` (uuid)
- `user_id` (FK to auth.users)
- `role` (enum: user, admin, super_admin)
- Unique constraint on (user_id, role)

**3. accounts** - Financial accounts (demo data)
- `id`, `user_id`, `account_type` (checking, savings, crypto, investment)
- `account_number`, `balance`, `currency`
- `status` (active, frozen, closed)
- `created_at`

**4. transactions** - Transaction records
- `id`, `user_id`, `account_id`
- `type` (deposit, withdrawal, transfer, crypto_buy, crypto_sell)
- `amount`, `currency`, `status` (pending, approved, declined, completed)
- `counterparty`, `description`
- `requires_approval`, `approved_by`, `approved_at`
- `created_at`

**5. crypto_holdings** - Crypto portfolio (demo)
- `id`, `user_id`
- `symbol`, `name`, `quantity`, `average_cost`
- `created_at`, `updated_at`

**6. kyc_documents** - KYC document storage
- `id`, `user_id`
- `document_type` (passport, drivers_license, utility_bill, bank_statement)
- `file_url`, `status` (pending, approved, rejected)
- `reviewed_by`, `reviewed_at`, `rejection_reason`
- `created_at`

**7. support_tickets** - Support system
- `id`, `user_id`
- `subject`, `description`, `status` (open, in_progress, resolved, closed)
- `priority` (low, medium, high, urgent)
- `assigned_to`, `resolved_at`
- `created_at`, `updated_at`

**8. audit_logs** (CRITICAL - Immutable)
- `id`, `actor_id` (who performed the action)
- `action_type` (user_created, account_frozen, balance_adjusted, role_assigned, etc.)
- `target_type`, `target_id` (what was affected)
- `old_value`, `new_value` (JSON)
- `reason` (REQUIRED - no silent changes)
- `ip_address`, `user_agent`
- `created_at`
- **RLS: SELECT only (no UPDATE, no DELETE)**

**9. fraud_alerts** - Risk monitoring
- `id`, `user_id`, `transaction_id`
- `alert_type`, `severity` (low, medium, high, critical)
- `description`, `status` (new, investigating, resolved, false_positive)
- `resolved_by`, `resolved_at`, `resolution_notes`
- `created_at`

### Security Functions

```text
has_role(user_id, role) - Security definer function to check roles
log_admin_action() - Trigger function for audit logging
```

### RLS Policies Summary
- Users: Read/update own profile only
- Admins: Read all, update with audit trail
- Audit logs: INSERT only (immutable), SELECT for admins
- All sensitive operations require server-side role verification

---

## Phase 2: User Dashboard

### Route Structure
```text
/dashboard              - Overview
/dashboard/accounts     - Account management
/dashboard/crypto       - Crypto portfolio
/dashboard/investments  - Investment holdings
/dashboard/transfers    - Send/receive money
/dashboard/settings     - Profile & security
```

### Components

**Dashboard Layout** (`src/components/dashboard/DashboardLayout.tsx`)
- SidebarProvider with collapsible sidebar
- Header with user menu and notifications
- Main content area

**Dashboard Sidebar** (`src/components/dashboard/DashboardSidebar.tsx`)
- Navigation: Overview, Accounts, Crypto, Investments, Transfers, Settings
- User profile summary
- Quick actions
- Logout button

**Dashboard Pages:**
- **Overview**: Balance summary cards, recent transactions, crypto mini-chart, quick actions
- **Accounts**: List of accounts with balances, account details view
- **Crypto**: Portfolio breakdown, holdings list, price tracking (demo data)
- **Investments**: Holdings summary, performance chart (demo)
- **Transfers**: Transfer form, transaction history
- **Settings**: Profile editing, security options, notification preferences

### Auth Context (`src/contexts/AuthContext.tsx`)
- Session management
- User profile loading
- Role checking
- Protected route wrapper

---

## Phase 3: Admin Portal (CRITICAL)

### Route Structure
```text
/admin                  - Dashboard overview
/admin/users            - User management
/admin/users/:id        - User detail view
/admin/transactions     - All transactions
/admin/crypto           - Crypto monitoring
/admin/compliance       - KYC & documents
/admin/funding          - Balance adjustments
/admin/logs             - Audit trail
/admin/tickets          - Support management
/admin/alerts           - Fraud alerts
```

### Admin Layout (`src/components/admin/AdminLayout.tsx`)
- Distinct admin styling (subtle red/orange accents for awareness)
- Admin-only sidebar
- Quick stats header
- Alert notifications

### Admin Sidebar Sections:
1. **Dashboard** - Overview with pending items count
2. **Users** - User list, search, filters
3. **Transactions** - All transactions, approval queue
4. **Crypto** - Platform-wide crypto activity
5. **Compliance** - KYC review queue
6. **Funding** - Balance adjustments (admin-only)
7. **Logs** - Immutable audit trail
8. **Tickets** - Support ticket management
9. **Alerts** - Fraud detection dashboard

### Core Admin Features:

**User Management (`/admin/users`)**
- User table with search, filter, sort
- Status indicators (active, frozen, pending)
- KYC status badges
- Quick actions: View, Freeze, Unfreeze
- User detail page with full history

**User Detail (`/admin/users/:id`)**
- Profile information
- Account list with balances
- Transaction history
- KYC documents
- Role management
- Action history
- Freeze/Unfreeze with reason modal

**Transaction Management (`/admin/transactions`)**
- Transaction table with filters
- Status: Pending, Approved, Declined, Completed
- Approval queue (highlighted)
- Approve/Decline with reason modal
- Batch operations

**Compliance (`/admin/compliance`)**
- KYC document review queue
- Document viewer
- Approve/Reject with notes
- User verification status

**Funding/Balance Adjustments (`/admin/funding`)**
- Balance adjustment form
- Reason REQUIRED
- Confirmation modal
- Immediate audit log entry
- History of all adjustments

**Audit Logs (`/admin/logs`)**
- Searchable, filterable log viewer
- Actor, action, target, reason, timestamp
- Export functionality
- Read-only (no edit/delete possible)

**Fraud Alerts (`/admin/alerts`)**
- Alert dashboard by severity
- Alert detail with transaction context
- Resolution workflow
- False positive marking

### Admin Rules Implementation:

1. **Every action requires a reason** - Modals with mandatory reason field
2. **Every action is logged** - Database triggers + client-side logging
3. **Logs are immutable** - RLS: No UPDATE/DELETE on audit_logs
4. **No silent changes** - All mutations go through audit function

### Admin Action Reason Modal (`src/components/admin/ActionReasonModal.tsx`)
- Reusable modal for all admin actions
- Required reason field (min 10 characters)
- Action type display
- Confirmation button
- Cancel option

---

## Phase 4: Contact Form Email

### Edge Function (`supabase/functions/send-contact-email/index.ts`)
- Receives form data from contact page
- Validates input with Zod
- Sends email using Resend API (or stores for later retrieval)
- Returns success/failure response

### Implementation Options:
1. **Resend Integration** - Requires API key setup
2. **Database Storage** - Store messages in `contact_submissions` table for admin review (no external API needed)

Recommended: Start with database storage, add email integration later.

**contact_submissions table:**
- `id`, `name`, `email`, `subject`, `message`
- `status` (new, read, replied)
- `created_at`, `read_at`, `replied_at`

---

## Phase 5: Security Implementation

### Authentication Flow:
1. User signs up → Profile auto-created via trigger
2. Default role: `user`
3. Admin role assigned manually (never via client)

### Role Verification:
- `has_role()` database function (SECURITY DEFINER)
- Server-side verification on all admin routes
- Edge function for role checking

### Protected Routes:
```typescript
// User routes: Check authenticated
// Admin routes: Check authenticated + has_role(uid, 'admin')
```

### Admin Route Guard (`src/components/admin/AdminGuard.tsx`)
- Verifies admin role via database function
- Redirects unauthorized users
- Shows loading state during verification

---

## Technical Details

### File Structure:
```text
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── OverviewCards.tsx
│   │   ├── RecentTransactions.tsx
│   │   ├── CryptoMiniChart.tsx
│   │   └── AccountCard.tsx
│   └── admin/
│       ├── AdminLayout.tsx
│       ├── AdminSidebar.tsx
│       ├── ActionReasonModal.tsx
│       ├── UserTable.tsx
│       ├── TransactionTable.tsx
│       ├── AuditLogViewer.tsx
│       ├── KYCReviewCard.tsx
│       ├── FraudAlertCard.tsx
│       └── StatsCard.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useAdmin.ts
│   └── useAuditLog.ts
├── pages/
│   ├── dashboard/
│   │   ├── DashboardIndex.tsx
│   │   ├── Accounts.tsx
│   │   ├── Crypto.tsx
│   │   ├── Investments.tsx
│   │   ├── Transfers.tsx
│   │   └── Settings.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminUsers.tsx
│       ├── AdminUserDetail.tsx
│       ├── AdminTransactions.tsx
│       ├── AdminCrypto.tsx
│       ├── AdminCompliance.tsx
│       ├── AdminFunding.tsx
│       ├── AdminLogs.tsx
│       ├── AdminTickets.tsx
│       └── AdminAlerts.tsx
└── lib/
    └── demo-data.ts  (seed data generators)

supabase/
└── functions/
    └── send-contact-email/
        └── index.ts
```

### Demo Data Strategy:
- Seed functions to generate realistic demo data
- Consistent across user accounts
- Simulated crypto prices (already built)
- Sample transactions, holdings, KYC documents

---

## Implementation Order

1. **Database Schema** - All tables, RLS policies, functions
2. **Auth Context** - Session management, role checking
3. **User Dashboard** - Layout, sidebar, all pages
4. **Admin Portal** - Layout, sidebar, all pages with action modals
5. **Contact Form** - Edge function or database storage
6. **Demo Data** - Seed realistic test data
7. **Polish** - Animations, loading states, error handling

---

## Estimated Components Count
- ~15 dashboard components
- ~20 admin components
- ~12 page components
- ~5 context/hook files
- ~10 database migrations
- ~1 edge function

This plan delivers an enterprise-grade platform with institutional security standards.
