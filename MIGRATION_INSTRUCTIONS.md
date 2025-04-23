# Essay Content Migration Instructions

Follow these steps to migrate essay content to Supabase:

## Step 1: Run content migration

This will add the content from markdown files to your Supabase database:

```bash
npm run migrate-content
```

## Step 2: Verify migration success

Check the logs to ensure that all essays were successfully migrated.

## Step 3: Run sync-essays script

This ensures that any metadata changes are also synchronized:

```bash
npm run sync-essays
```

## Step 4: Start the development server

Start your development server to test the changes:

```bash
npm run dev
```

## Step 5: Verify essays work

Visit your site and verify that essays load correctly from both:
- The writing page (by clicking on an essay)
- Direct URL access (by entering the URL directly)

## Troubleshooting

If you encounter any issues:

1. Check the Supabase database to ensure the 'content' column exists and contains HTML content
2. Use the browser's developer tools to check for any errors in the console
3. Make sure your Supabase API keys in .env are correct and have write permissions
4. Try running the migration with the SERVICE_ROLE_KEY if you have permissions issues