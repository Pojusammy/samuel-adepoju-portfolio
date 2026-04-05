# Samuel Adepoju Portfolio

A production-ready editorial portfolio built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, `next/image`, `next/font`, and an MDX-powered project archive.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- MDX via `next-mdx-remote`

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000).

## Content editing

### Summary and social links

Edit [`data/site.json`](/Users/samueladepoju/Documents/newpotoCodex/data/site.json).

### Design showcase items

Edit [`data/showcase.json`](/Users/samueladepoju/Documents/newpotoCodex/data/showcase.json).

### Live projects

Each project lives in [`content/projects`](/Users/samueladepoju/Documents/newpotoCodex/content/projects) as an `.mdx` file.

Supported frontmatter:

```md
---
title: "Project title"
date: "2026-01-24"
excerpt: "Short summary used on the homepage and for metadata."
thumbnail: "/images/projects/example.svg"
thumbnailAlt: "Short image description."
coverImage: "/images/projects/example.svg"
coverAlt: "Optional cover image alt text."
liveUrl: "https://example.com"
role: "Optional role description"
---
```

Inside the body you can use normal Markdown plus:

- `<ContentImage src="" alt="" caption="" />`
- `<Callout title="">...</Callout>`

## Admin editor

The site now includes a simple built-in admin at `/admin`.

### What you can edit

- Homepage metadata, hero title, subtitle, intro, and paragraph copy
- Top navigation and contact links
- Accent link colors
- Design showcase entries
- Project frontmatter and full MDX case study bodies
- Image uploads into `public/images/...`

### Local setup

1. Copy [`.env.example`](/Users/samueladepoju/Documents/newpotoCodex/.env.example) to `.env.local`
2. Set `ADMIN_PASSWORD` to the password you want to use
3. Set `ADMIN_SECRET` to any long random string
4. Run `npm run dev`
5. Open `/admin`

### Production setup on Vercel

To let the admin save changes in production, add these environment variables in Vercel:

- `ADMIN_PASSWORD`
- `ADMIN_SECRET`
- `GITHUB_ADMIN_TOKEN`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_REPO_BRANCH`

The `GITHUB_ADMIN_TOKEN` should be a GitHub token with write access to the repository contents. When you save from `/admin`, the app commits the updated file back to GitHub and Vercel redeploys automatically from `main`.

### Uploading images

Use the Uploads tab in `/admin`. After upload, copy the returned path such as:

```txt
/images/uploads/my-image.png
```

Then paste that path into the project, showcase, or other image fields you want to update.

## File structure

- `app` for routes, layout, metadata, and Open Graph image generation
- `components` for reusable UI building blocks
- `content/projects` for MDX case studies
- `data` for homepage content and showcase metadata
- `lib` for content loading, types, and helpers
- `public/images` for ambient, project, and showcase assets

## Deploy

The site is statically generated where possible and works well on Vercel.

```bash
npm run build
```

Then deploy the repository to your preferred Next.js host.

## Architecture notes

- The hero summary, social links, and showcase entries live in central JSON data files so content is easy to update without digging through components.
- Project metadata is stored in MDX frontmatter, making each case study the source of truth for both the homepage listing and its detail page.
- The dark theme uses a softened full-page ambient image layer with overlays, while light mode intentionally strips back to a quieter plain background.
- The built-in `/admin` editor is password-protected and can save locally in development or commit back to GitHub in production.
