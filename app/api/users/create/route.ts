import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/firebase';
import { verifyIdToken } from '@/lib/auth'; // You'll need to create this

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the Firebase token
    const decodedToken = await verifyIdToken(token);
    const uid = decodedToken.uid;

    // Get request body
    const body = await request.json();
    const { firstName, lastName, email, phoneNumber, birthDate } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !birthDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would save to your backend database
    // Example: PostgreSQL, MongoDB, etc.
    // const user = await db.users.create({
    //   uid,
    //   firstName,
    //   lastName,
    //   email,
    //   phoneNumber,
    //   birthDate,
    //   createdAt: new Date(),
    // });

    // For now, return success
    return NextResponse.json(
      { 
        success: true,
        message: 'User created successfully',
        // user 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
