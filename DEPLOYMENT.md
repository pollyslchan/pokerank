# Deployment Guide

## Prerequisites

- Node.js and npm
- PostgreSQL database
- Environment variables for database connection

## Environment Variables

Make sure these environment variables are set in your deployment environment:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
PGHOST=hostname
PGPORT=port
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
```

## Deployment Steps

### Option 1: Deploy on Replit

1. Create a new Repl using the GitHub repository
2. Add the required environment secrets in the Replit UI
3. Run the command `npm run db:push` to set up the database schema
4. Start the application with `npm run dev`
5. Use the Replit "Run" button or set up a persistent deployment

### Option 2: Deploy on a VPS or Cloud Service

1. Clone the repository:
   ```bash
   git clone https://github.com/pollyslchan/pokemon-rankings.git
   cd pokemon-rankings
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Build the application:
   ```bash
   npm run build
   ```

6. Start the server:
   ```bash
   npm start
   ```

### Option 3: Deploy on Vercel, Netlify, or similar platforms

1. Connect your GitHub repository to the platform
2. Configure the build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
3. Add environment variables in the platform's UI
4. Deploy the application

## Database Considerations

- Make sure your PostgreSQL database is accessible from your deployment environment
- Consider using a managed PostgreSQL service (like Neon, Supabase, or AWS RDS) for production deployments
- Regular backups are recommended to prevent data loss

## Monitoring and Maintenance

- Set up monitoring for your application to track errors and performance
- Regularly update dependencies to ensure security patches are applied
- Consider implementing a CI/CD pipeline for automated testing and deployment