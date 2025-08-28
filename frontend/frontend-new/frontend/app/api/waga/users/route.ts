import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { userRoles } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userAddress,
      role,
      permissions,
      assignedBy
    } = body;

    // Validate required fields
    if (!userAddress || !role || !assignedBy) {
      return NextResponse.json(
        { error: 'Missing required fields (userAddress, role, assignedBy)' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'distributor', 'user'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: admin, distributor, or user' },
        { status: 400 }
      );
    }

    // Check if user already has a role
    const [existingRole] = await db.select()
      .from(userRoles)
      .where(eq(userRoles.userAddress, userAddress));

    if (existingRole) {
      // Update existing role
      const [updatedRole] = await db.update(userRoles)
        .set({
          role,
          permissions: permissions ? JSON.stringify(permissions) : null,
          assignedBy,
          assignedAt: new Date(),
          isActive: true
        })
        .where(eq(userRoles.userAddress, userAddress))
        .returning();

      return NextResponse.json({
        success: true,
        message: 'User role updated successfully',
        userRole: updatedRole
      });
    } else {
      // Create new role
      const [newRole] = await db.insert(userRoles).values({
        userAddress,
        role,
        permissions: permissions ? JSON.stringify(permissions) : null,
        assignedBy,
        isActive: true
      }).returning();

      return NextResponse.json({
        success: true,
        message: 'User role created successfully',
        userRole: newRole
      });
    }

  } catch (error) {
    console.error('Error managing user role:', error);
    return NextResponse.json(
      { error: 'Failed to manage user role' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const role = searchParams.get('role');
    
    if (userAddress) {
      // Get specific user role
      const [userRole] = await db.select()
        .from(userRoles)
        .where(eq(userRoles.userAddress, userAddress));
      
      if (!userRole) {
        return NextResponse.json({
          success: true,
          userRole: null,
          message: 'No role found for this user'
        });
      }

      return NextResponse.json({
        success: true,
        userRole
      });
    } else if (role) {
      // Get all users with specific role
      const users = await db.select()
        .from(userRoles)
        .where(eq(userRoles.role, role));
      
      return NextResponse.json({
        success: true,
        users
      });
    } else {
      // Get all user roles
      const allRoles = await db.select().from(userRoles);
      
      return NextResponse.json({
        success: true,
        userRoles: allRoles
      });
    }

  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user roles' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress parameter is required' },
        { status: 400 }
      );
    }

    // Deactivate user role instead of deleting
    const [deactivatedRole] = await db.update(userRoles)
      .set({ isActive: false })
      .where(eq(userRoles.userAddress, userAddress))
      .returning();

    if (!deactivatedRole) {
      return NextResponse.json(
        { error: 'User role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User role deactivated successfully',
      userRole: deactivatedRole
    });

  } catch (error) {
    console.error('Error deactivating user role:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate user role' },
      { status: 500 }
    );
  }
}
