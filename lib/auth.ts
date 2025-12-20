import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp;
if (!getApps().length) {
	adminApp = initializeApp({
		credential: cert({
			projectId: process.env.FIREBASE_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
		}),
	});
} else {
	adminApp = getApps()[0];
}

const adminAuth = getAuth(adminApp);

export async function verifyIdToken(token: string) {
	try {
		return await adminAuth.verifyIdToken(token);
	} catch (error) {
		throw new Error('Invalid token');
	}
}
// ...existing code...
