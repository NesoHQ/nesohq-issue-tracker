# Upgrade Steps: Vite → Next.js

Follow these steps to complete the migration:

## 1. Backup (Optional but Recommended)

```bash
# From the client directory
git add -A
git commit -m "Backup before Next.js migration"
```

## 2. Clean Old Build Artifacts

```bash
rm -rf node_modules dist .vite
```

## 3. Install Dependencies

```bash
npm install
```

This will install Next.js and all required dependencies.

## 4. Remove Old Files (Optional)

These files are no longer needed:

```bash
rm vite.config.ts
rm src/main.tsx
rm src/app/App.tsx
rm postcss.config.mjs.old  # if exists
```

## 5. Environment Setup

If you had a `.env` file, create `.env.local`:

```bash
# Copy your API URL if you had one
echo "NEXT_PUBLIC_API_URL=" > .env.local
```

## 6. Start Development Server

```bash
npm run dev
```

The app should now run on http://localhost:3000

## 7. Test Key Functionality

- [ ] Sign in with GitHub
- [ ] OAuth callback works
- [ ] Workspace loads
- [ ] Can view repositories
- [ ] Can view issues
- [ ] Can create issues
- [ ] Can edit issues
- [ ] Dark mode toggle works
- [ ] Sign out works

## 8. Update Backend CORS (if needed)

If your backend has CORS restrictions, update it to allow `http://localhost:3000`:

```typescript
// In server/app.ts or similar
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

## 9. Production Build Test

```bash
npm run build
npm start
```

## Troubleshooting

### Port Already in Use

If port 3000 is taken:
```bash
PORT=3001 npm run dev
```

### API Connection Issues

Check that:
1. Backend server is running on port 3001
2. `.env.local` is configured correctly
3. Next.js rewrites are working (check `next.config.ts`)

### Module Not Found Errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Hydration Errors

These are usually caused by:
- Server/client mismatch in theme
- localStorage access during SSR

All components are marked with `'use client'` to avoid this.

## Rollback (if needed)

```bash
git reset --hard HEAD~1
npm install
```

## Success!

Once everything works, you can:
1. Delete old Vite-related files
2. Update your deployment configuration
3. Update documentation
