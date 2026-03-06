Vercel Deployment Checklist

This document describes steps to deploy the bakery management system to Vercel.

1) Frontend (Next.js) — deploy to Vercel

- Confirm `package.json` has build/start scripts (it does: `next build`, `next start`).

- Required environment variables (set in Vercel project > Settings > Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon/public key
  - (If using Supabase server-side helpers) any server keys in the backend or Vercel environment (do NOT expose server keys as NEXT_PUBLIC_*)

- Recommended Vercel settings:
## Fixing Windows EPERM / locked native module (quick)
If `npm ci` fails on Windows with an EPERM error referencing `next-swc.win32-x64-msvc.node`, do the following:

- Close editors and stop Node/CLI processes that might hold the file (close VS Code and terminals).
- Temporarily disable antivirus or add the project folder to exclusions.
- From the `frontend` folder run the cleanup script we added:

```powershell
cd frontend
npm run cleanup
```

If the script exits with errors because the file is locked, run PowerShell as Administrator and run these commands:

```powershell
# stop Node processes
Get-Process node | Stop-Process -Force
# remove node_modules folder
Remove-Item -Recurse -Force .\node_modules
# remove package-lock
Remove-Item -Force .\package-lock.json
# clear npm cache
npm cache clean --force
# reinstall
npm ci
```

After `npm ci` completes, run:

```powershell
npm run build
```

Vercel will auto-detect the Next.js project at the root. Do NOT set `rootDirectory` in `vercel.json` as the project is now at the root. Ensure environment variables are set in the Vercel project settings rather than committed to source.
  - Framework Preset: `Next.js` (Vercel auto-detects this)
  - Build Command: leave blank (Vercel will run `npm install && npm run build` in the detected root). If you prefer explicit: `cd frontend && npm ci && npm run build`.
  - Output directory: leave empty for Next.js (Vercel handles it).

- Fixes applied in this repo:
  - `vercel.json` cleaned to remove SPA rewrites that conflict with Next.js routing.
  - Production reports, shop, institutions pages use live Supabase APIs; no mock data left in those flows.

- To deploy from this repo (quick):
  - Connect repo in Vercel dashboard. Vercel will auto-detect the Next.js project at the repository root and build automatically.

2) Backend Architecture

The system now uses Supabase as the primary backend:
- All database operations go through Supabase directly (client and server-side via API routes)
- Next.js API routes (`src/app/api/*`) provide additional endpoints when needed
- No separate Express backend required
- This keeps deployment simple: Vercel hosts the entire Next.js application with Supabase connection

3) Database & permissions

- Ensure Supabase schema includes the tables referenced by the frontend: `production_batches`, `batch_products`, `route_dispatch`, `route_dispatch_products`, `route_returns`, `route_return_products`, `products`, `shop_stock`, `shop_transfers`, `shop_transfer_products`, `institution_orders`, `institution_order_products`, `institutions`, `production_operations_settings`.
- If using the provided SQL files, apply them in the Supabase SQL editor.
- Configure Row-Level Security (RLS) and policies to allow appropriate authenticated writes/inserts.

4) Post-deploy checks

- After deployment, verify in the Vercel dashboard that environment variables are set for Production.
- Visit the site and test:
  - Login/register redirect to `/production` works
  - Production reports load and Export CSV works
  - Institutions and Shop pages load live data

5) Troubleshooting

- If you see client/server hook errors (Next.js expects server components), ensure pages that use `useState`/`useEffect` include `"use client"`.
- If builds fail on Vercel, check Build logs for missing env vars or TypeScript errors.

If you want, I can:
- Add a simple Vercel `project.json` or modify `vercel.json` further for monorepo deployments.
- Convert the `backend` Express app to Vercel serverless API routes (one-time refactor).
- Run a static scan in the repo for other `use client`/server-hooks mismatches.

Which of these would you like me to do next?
