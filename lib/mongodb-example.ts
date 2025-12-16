/**
 * Example MongoDB usage in API routes
 * 
 * This file shows how to use MongoDB in your Next.js API routes.
 * You can import and use these patterns in your API routes.
 */

import clientPromise, { getDatabase } from './mongodb';

// Example: Create a user in MongoDB
export async function createUser(userData: {
  email: string;
  name: string;
  createdAt: Date;
}) {
  try {
    const db = await getDatabase();
    const collection = db.collection('users');
    
    const result = await collection.insertOne(userData);
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Example: Get a user by email
export async function getUserByEmail(email: string) {
  try {
    const db = await getDatabase();
    const collection = db.collection('users');
    
    const user = await collection.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

// Example: Update a user
export async function updateUser(email: string, updates: Record<string, any>) {
  try {
    const db = await getDatabase();
    const collection = db.collection('users');
    
    const result = await collection.updateOne(
      { email },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Example usage in an API route:
/*
import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/mongodb-example';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createUser({
      email: body.email,
      name: body.name,
      createdAt: new Date(),
    });
    
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
*/

