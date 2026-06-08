# Admin User Management System

## Overview

The Admin User Management system provides administrators with complete control over user accounts in the Employee Wellbeing Platform. Admins can create, read, update, delete, and manage user access across the application.

## Features

### 1. **View All Users**
- Display a comprehensive table of all users in the system
- View user details: name, email, department, role, status, and active/inactive state
- Search users by name, email, or department
- Sort and filter user information

### 2. **Create New Users**
- Add new users to the system directly from the admin panel
- Set user details: name, email, password, role, department
- Assign roles: Employee, HR Representative, or Administrator
- Set initial status: Pending, Approved, or Declined
- Configure active/inactive state upon creation

### 3. **Edit User Information**
- Update user profile: name, email, and department
- Change user role (employee, hr, admin)
- Update approval status
- Modify password without needing the old password
- Toggle active/inactive status

### 4. **Activate/Deactivate Users**
- Toggle user account status between active and inactive
- Inactive users cannot log into the system
- Useful for temporary account suspension without permanent deletion

### 5. **Delete Users Permanently**
- Permanently remove users from the system
- Includes a confirmation dialog to prevent accidental deletion
- Prevents admin from deleting their own account
- Irreversible operation (cannot be undone)

### 6. **User Status Management**
- **Pending**: User registration is awaiting admin approval
- **Approved**: User account is active and approved
- **Declined**: User registration was rejected
- **Active/Inactive**: Controls whether user can log in

## Access & Permissions

- **Admin-Only Access**: Only users with the `admin` role can access user management
- **Protected Routes**: All admin routes are protected by middleware authentication
- **API Authentication**: All admin API endpoints require valid JWT token with admin role

## API Endpoints

### GET /api/admin/users
Retrieve all users in the system.

**Response:**
```json
{
  "data": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "employee",
      "department": "Engineering",
      "status": "approved",
      "isActive": 1,
      "pointsBalance": 100,
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### GET /api/admin/users/:id
Retrieve a specific user by ID.

### POST /api/admin/users
Create a new user.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com",
  "password": "SecurePassword123!",
  "role": "employee",
  "department": "Sales",
  "status": "approved",
  "isActive": true
}
```

### PATCH /api/admin/users/:id
Update an existing user.

**Request Body (any combination of fields):**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.smith@company.com",
  "password": "NewPassword123!",
  "role": "hr",
  "department": "Marketing",
  "status": "approved",
  "isActive": true
}
```

### DELETE /api/admin/users/:id
Permanently delete a user.

**Response:**
```json
{
  "message": "User permanently deleted",
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@company.com"
  }
}
```

## Database Changes

### Schema Update
The `users` table has been extended with:
- `isActive` (integer): Tracks whether a user account is active (1) or inactive (0). Default: 1
- `updatedAt` (text): Timestamp of last user modification. Auto-generated on updates

### Migration Command
```bash
npm run db:push
# or
npx drizzle-kit push
```

## User Interface

### Admin Dashboard
- Access via `/admin` route
- Shows user management options and quick statistics
- Link to full user management system

### User Management Page
- Route: `/admin/users`
- Features:
  - Search bar for finding users
  - User table with all details
  - Action buttons: Edit, Delete
  - Active/Inactive toggle column
  - Create User button
  - Real-time user count display

### User Form Modal
- Opens for creating or editing users
- Form fields:
  - Name (required)
  - Email (required, must be unique)
  - Password (required for create, optional for edit)
  - Role (dropdown: Employee, HR, Admin)
  - Department (dropdown: multiple departments)
  - Status (dropdown: Pending, Approved, Declined)
  - Active checkbox (toggles active/inactive)
- Save button with loading state
- Cancel button to close without saving
- Toast notifications for success/error messages

## Navigation

### Accessing User Management
1. Log in as an admin user
2. Open the sidebar/navigation menu
3. Click "User Management" option (admin-only)
4. Or navigate directly to `/admin/users`

### Sidebar Changes
- New menu item: "User Management" (only visible to admins)
- Icon: Users (from lucide-react)
- Position: Below Dashboard in the admin menu

## Error Handling

### Validation Errors
- Missing required fields: Returns 400 status with descriptive error
- Invalid role: Must be 'employee', 'hr', or 'admin'
- Duplicate email: Email must be unique in system
- Invalid status: Must be 'pending', 'approved', or 'declined'

### Permission Errors
- Non-admin users: Returns 403 Forbidden
- Unauthenticated requests: Returns 401 Unauthorized
- Cannot delete self: Returns 400 Bad Request

### Server Errors
- Database errors: Returns 500 Internal Server Error
- All errors include descriptive error messages

## Security Features

1. **Role-Based Access Control**: Only admins can manage users
2. **Middleware Protection**: All admin routes protected by JWT authentication
3. **Password Hashing**: All passwords hashed with bcryptjs (10 salt rounds)
4. **Self-Deletion Prevention**: Admins cannot delete their own account
5. **Token Verification**: All requests require valid JWT token
6. **User Headers**: Admin details passed securely in request headers

## Testing Default Accounts

The application comes with default admin account for testing:
- **Email**: `admin@company.com`
- **Password**: `Password123!`
- **Role**: Administrator

## File Structure

```
components/
├── admin/
│   ├── UserManagementTable.tsx    # Main user table component
│   └── UserFormModal.tsx           # Create/edit form modal
├── ui/
│   └── input.tsx                   # Input component

app/
└── (app)/
    └── admin/
        ├── page.tsx                # Admin dashboard
        └── users/
            └── page.tsx            # User management page

lib/
└── schema.ts                       # Updated user schema

api/
└── admin/
    └── users/
        └── [[...slug]]/
            └── route.ts            # User management API
```

## Future Enhancements

- Bulk user import/export (CSV)
- User activity logs
- Automatic account expiration
- Email notifications on user actions
- Two-factor authentication management
- User permission groups/teams
- Advanced filtering and sorting
- User activity dashboard
