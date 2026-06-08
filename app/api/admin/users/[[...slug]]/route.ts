import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const slug = params.slug || [];

    // 1. GET /api/admin/users/pending
    if (slug.length === 1 && slug[0] === 'pending') {
      const pendingUsers = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          department: schema.users.department,
          status: schema.users.status,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .where(eq(schema.users.status, 'pending'))
        .all();

      // Sort by oldest signup first
      pendingUsers.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return NextResponse.json({ data: pendingUsers });
    }

    // 2. GET /api/admin/users (all users)
    if (slug.length === 0) {
      const allUsers = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          department: schema.users.department,
          status: schema.users.status,
          isActive: schema.users.isActive,
          pointsBalance: schema.users.pointsBalance,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt,
        })
        .from(schema.users)
        .all();

      return NextResponse.json({ data: allUsers });
    }

    // 3. GET /api/admin/users/:id (single user)
    if (slug.length === 1) {
      const targetUserId = slug[0];
      const user = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          department: schema.users.department,
          status: schema.users.status,
          isActive: schema.users.isActive,
          pointsBalance: schema.users.pointsBalance,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt,
        })
        .from(schema.users)
        .where(eq(schema.users.id, targetUserId))
        .get();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ data: user });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role: userRole, department, status = 'approved', isActive = true } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !userRole || !department) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role, department' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['employee', 'hr', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: employee, hr, admin' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .get();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(schema.users)
      .values({
        name,
        email,
        passwordHash,
        role: userRole,
        department,
        status,
        roles: JSON.stringify([userRole]),
        isActive: isActive ? 1 : 0,
      })
      .returning()
      .get();

    return NextResponse.json(
      {
        message: 'User created successfully',
        data: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          status: newUser.status,
          isActive: newUser.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const slug = params.slug || [];

    // 1. PATCH /api/admin/users/:id (for both approval and user updates)
    if (slug.length === 1) {
      const targetUserId = slug[0];
      const body = await request.json();
      const { status, name, email, role: userRole, department, isActive, password } = body;

      const targetUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, targetUserId))
        .get();

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      // Handle approval/rejection of pending users
      if (status && targetUser.status === 'pending') {
        if (!['approved', 'declined'].includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status. Must be "approved" or "declined"' },
            { status: 400 }
          );
        }
        updateData.status = status;
      }

      // Handle user profile updates
      if (name) updateData.name = name;
      if (department) updateData.department = department;
      if (userRole) {
        if (!['employee', 'hr', 'admin'].includes(userRole)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }
        updateData.role = userRole;
        updateData.roles = JSON.stringify([userRole]);
      }

      // Handle email update (check for duplicates)
      if (email && email !== targetUser.email) {
        const existingUser = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .get();
        if (existingUser) {
          return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        updateData.email = email;
      }

      // Handle password update
      if (password) {
        updateData.passwordHash = await hashPassword(password);
      }

      // Handle active/inactive status
      if (typeof isActive === 'boolean') {
        updateData.isActive = isActive ? 1 : 0;
      }

      const updatedUser = await db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, targetUserId))
        .returning()
        .get();

      return NextResponse.json({
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          status: updatedUser.status,
          isActive: updatedUser.isActive,
          updatedAt: updatedUser.updatedAt,
        },
      });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('Error in PATCH /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug?: string[] } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role');

    if (!userId || role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const slug = params.slug || [];

    // DELETE /api/admin/users/:id (permanent deletion)
    if (slug.length === 1) {
      const targetUserId = slug[0];

      // Prevent deleting yourself
      if (targetUserId === userId) {
        return NextResponse.json(
          { error: 'Cannot delete your own account' },
          { status: 400 }
        );
      }

      const targetUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, targetUserId))
        .get();

      if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Delete the user
      await db
        .delete(schema.users)
        .where(eq(schema.users.id, targetUserId));

      return NextResponse.json({
        message: 'User permanently deleted',
        data: {
          id: targetUserId,
          name: targetUser.name,
          email: targetUser.email,
        },
      });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

