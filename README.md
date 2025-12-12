This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

**If you're using MongoDB**, install the MongoDB driver:

```bash
npm install mongodb
# or
yarn add mongodb
# or
pnpm add mongodb
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

# MongoDB Configuration
mongodb+srv://VenuProject_25:VenuProj123$@venu.5bqy5py.mongodb.net/retryWrites=true&w=majority
# Optional: Specify database name (defaults to 'venu-db')
# MONGODB_DB_NAME=venu-db

# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/database-name
```

**MongoDB Connection String Format:**
- **MongoDB Atlas (Cloud):** `mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority`
- **Local MongoDB:** `mongodb://localhost:27017/database-name`

Replace:
- `username` - Your MongoDB username
- `password` - Your MongoDB password
- `cluster.mongodb.net` - Your MongoDB cluster address
- `database-name` - Your database name

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
