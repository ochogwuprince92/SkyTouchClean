# Database Setup Scripts

These scripts require MongoDB to be running.

## Prerequisites

1. **MongoDB Installation**: Install MongoDB locally or set up a MongoDB Atlas cluster
2. **Environment Variables**: Copy `.env.test` to `.env.local` and configure your MongoDB connection

```bash
cp .env.test .env.local
# Edit .env.local with your MongoDB credentials
```

## Available Scripts

### setup-indexes
Creates all required MongoDB indexes. This is idempotent and can be run multiple times.

```bash
npm run setup-indexes
```

### seed
Seeds the database with:
- Services (from docs/02)
- Service prices (from docs/02, amounts in kobo)
- First admin user (from ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME env vars)

This is idempotent - running it multiple times will not create duplicates.

```bash
npm run seed
```

### test-seed
Validates that seeded data matches docs/02 exactly.

```bash
npm run test-seed
```

## Running in Order

1. Start MongoDB
2. Run `npm run setup-indexes`
3. Run `npm run seed`
4. Run `npm run test-seed` to verify

## MongoDB Atlas Setup

If using MongoDB Atlas:
1. Create a free cluster
2. Create a database user with read/write permissions
3. Whitelist your IP address (or use 0.0.0.0/0 for development)
4. Get the connection string and set MONGODB_URI in .env.local
