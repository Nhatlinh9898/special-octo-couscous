# Database Setup Instructions

## Problem
The TypeScript error occurs because the database schema is incomplete. The database only has basic tables (schools, users, classes, students, subjects, schedules) but is missing all Exam-related tables.

## Solution Steps

### 1. Start PostgreSQL Database
Make sure your PostgreSQL server is running at localhost:5432 with the database "edumanager".

### 2. Apply Database Migrations
```bash
cd backend
npx prisma migrate dev --name add_complete_schema
```

This will create all missing tables including:
- exams
- questions  
- question_options
- exam_submissions
- submission_answers
- grades
- And all other missing tables

### 3. Regenerate Prisma Client
```bash
npx prisma generate
```

### 4. Verify Database Connection
Check that your .env file has the correct DATABASE_URL:
```
DATABASE_URL="postgresql://username:password@localhost:5432/edumanager"
```

## Alternative: Reset Database
If you want to start fresh:
```bash
npx prisma migrate reset
```

This will drop all tables and recreate them from the schema.

## After Database Setup
Once the database is properly set up, the TypeScript errors should be resolved because:
- The `class` relation will exist in the generated types
- All exam-related fields (startTime, endTime, maxAttempts, etc.) will be available
- The `examSubmission` model will be accessible
