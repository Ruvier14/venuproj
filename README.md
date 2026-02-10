This project is configured for deployment on Render.com.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Set the following environment variables in your Render dashboard:

- NEXTAUTH_SECRET=your-secret-key-here
- NEXTAUTH_URL=https://your-app.onrender.com
- GOOGLE_CLIENT_ID=your-google-client-id
- GOOGLE_CLIENT_SECRET=your-google-client-secret
- FACEBOOK_CLIENT_ID=your-facebook-client-id
- FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
- APPLE_ID=your-apple-id
- APPLE_SECRET=your-apple-secret
- NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
- NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
- NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
- FIREBASE_PROJECT_ID=your-firebase-project-id
- FIREBASE_CLIENT_EMAIL=your-firebase-admin-client-email
- FIREBASE_PRIVATE_KEY=your-firebase-admin-private-key

Generate a secure `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

Or use any random string (minimum 32 characters recommended).

### 3. Run the Development Server

=======
First, run the development server:

> > > > > > > 7e5d4ff74576e5e84bd7b1907d4ec461256d6109

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

For Render deployment and setup, see the Render documentation: https://render.com/docs/deploy-nextjs
2. Set the build command to:

    npm install && npm run build

3. Set the start command to:

    npm run start

4. Add your environment variables in the Render dashboard (see `.env.local` example above).
5. Optionally, add a `render.yaml` file for advanced configuration (see project root).

For more details, see [Render's Next.js deployment guide](https://render.com/docs/deploy-nextjs).
