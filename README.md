# The Wonder Footprint

An independent location-intelligence project for Wonder locations and announced expansion markets. It includes state, lifecycle, and current-hours filters; location search; nearby-location discovery; address-level geocoding; and direct links to official listings.

The repository stores a validated snapshot of names, addresses, statuses, and published hours from Wonder's public directory. A scheduled GitHub Actions workflow attempts to refresh it and commits only fully validated results. If Wonder blocks unattended access, the workflow safely retains the last verified snapshot instead of failing or publishing incomplete data. Netlify automatically deploys verified changes from `main`.

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
