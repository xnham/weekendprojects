# CLAUDE.md

## General Principle
- Always analyze and form hypotheses carefully before changing the code. 
- Do not update the code until I explicitly tell you to do so.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Typecheck the codebase
- `npm run sync-essays` - Sync markdown essays with Supabase
- `npm run deploy` - Build and deploy to GitHub Pages

## Code Style
- Use TypeScript with strict mode
- Follow SvelteKit conventions for file structure and routing
- Prefer ES modules (`import`/`export`) - project uses `"type": "module"`
- Errors: Use proper error handling with try/catch blocks
- Markdown content: Use mdsvex for processing
- Component naming: PascalCase for components
- Variable naming: camelCase
- Paths: Use absolute imports with $lib alias (e.g., `import X from '$lib/utils'`)
- For content imports, use $content alias (e.g., `import X from '$content/essays/file.md'`)

## Architecture Notes
- Content is stored in markdown files under src/content
- Uses Supabase for interaction data and metadata
- Server components use +page.server.js for data loading
- Styling is component-scoped with global variables in app.css