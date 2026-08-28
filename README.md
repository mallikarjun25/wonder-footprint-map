# The Wonder Footprint

An independent location-intelligence project for Wonder locations and announced expansion markets. It includes state, lifecycle, and current-hours filters; location search; nearby-location discovery; address-level geocoding; and direct links to official listings.

Location names, addresses, statuses, and published hours are refreshed from Wonder's public directory by a scheduled GitHub Actions workflow. A validated JSON snapshot remains in the repository so the public site continues to build if the source is temporarily unavailable. Netlify automatically deploys verified changes from `main`.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Refresh the directory snapshot manually with:

```bash
npm run sync:locations
```

Create a production build with `npm run build`. The application is a standard Next.js project suitable for Netlify's maintained Next.js runtime.

## Data and attribution

Location information is derived from Wonder's public location directory and may change. Map data is provided by OpenStreetMap contributors. This independent portfolio project is not affiliated with or endorsed by Wonder Group, Inc.
