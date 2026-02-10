This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

<<<<<<< HEAD

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
APPLE_ID=your-apple-id
APPLE_SECRET=your-apple-secret

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-firebase-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id

# Firebase Admin SDK (for server-side verification)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-admin-client-email
FIREBASE_PRIVATE_KEY=your-firebase-admin-private-key
```

**Important:** Generate a secure `NEXTAUTH_SECRET` using one of these methods:

**Windows (PowerShell):**

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Mac/Linux:**

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

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Render

To deploy your Next.js app on [Render](https://render.com), follow these steps:

1. Create a new Web Service on Render and connect your GitHub repository.
2. Set the build command to:

    npm install && npm run build

3. Set the start command to:

    npm run start

4. Add your environment variables in the Render dashboard (see `.env.local` example above).
5. Optionally, add a `render.yaml` file for advanced configuration (see project root).

For more details, see [Render's Next.js deployment guide](https://render.com/docs/deploy-nextjs).
