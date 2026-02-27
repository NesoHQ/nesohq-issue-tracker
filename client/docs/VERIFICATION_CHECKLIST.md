# Migration Verification Checklist

Use this checklist to verify the Next.js migration is complete and working.

## Pre-Migration

- [ ] Backup current code (`git commit`)
- [ ] Document any custom configurations
- [ ] Note current working features

## Installation

- [ ] Old build artifacts removed (`rm -rf node_modules dist`)
- [ ] Dependencies installed (`npm install`)
- [ ] No installation errors
- [ ] `node_modules` directory created
- [ ] `.next` directory created after first run

## Configuration

- [ ] `next.config.ts` exists
- [ ] `tailwind.config.ts` exists
- [ ] `tsconfig.json` updated
- [ ] `.env.local` created (if needed)
- [ ] `.gitignore` includes `.next/` and `out/`

## File Structure

- [ ] `app/` directory exists
- [ ] `app/layout.tsx` exists
- [ ] `app/page.tsx` exists
- [ ] `app/auth/callback/page.tsx` exists
- [ ] `app/workspace/page.tsx` exists
- [ ] `src/` directory preserved with all components

## Development Server

- [ ] `npm run dev` starts without errors
- [ ] Server runs on port 3000
- [ ] No TypeScript errors in terminal
- [ ] Hot reload works when editing files
- [ ] No console errors in browser

## Authentication Flow

- [ ] Home page (`/`) loads and shows SignIn component
- [ ] "Sign in with GitHub" button visible
- [ ] Clicking sign in redirects to GitHub
- [ ] OAuth callback (`/auth/callback`) works
- [ ] Successfully redirects to `/workspace` after auth
- [ ] User info displayed in workspace
- [ ] Sign out works and redirects to home

## Workspace Features

- [ ] Workspace page loads
- [ ] Repository sidebar visible
- [ ] Can select repositories
- [ ] Issues list loads
- [ ] Can view issue details
- [ ] Can create new issues
- [ ] Can edit existing issues
- [ ] Can close/reopen issues
- [ ] Markdown editor works
- [ ] Image upload works (if applicable)

## UI/UX

- [ ] All components render correctly
- [ ] No layout shifts or flashing
- [ ] Dark mode toggle works
- [ ] Theme persists on reload
- [ ] Responsive design works on mobile
- [ ] All icons display correctly
- [ ] Buttons and interactions work
- [ ] Modals and dialogs work

## API Communication

- [ ] Backend server running on port 3001
- [ ] API calls succeed
- [ ] No CORS errors
- [ ] Error handling works
- [ ] Loading states display correctly
- [ ] Session expiration handled correctly

## Performance

- [ ] Initial page load is fast
- [ ] Navigation between pages is smooth
- [ ] No memory leaks in dev tools
- [ ] Images load properly
- [ ] No unnecessary re-renders

## Build & Production

- [ ] `npm run build` completes successfully
- [ ] No build errors or warnings
- [ ] Build output in `.next/` directory
- [ ] `npm start` runs production server
- [ ] Production build works correctly
- [ ] All features work in production mode

## Cleanup

- [ ] Old `vite.config.ts` removed (optional)
- [ ] Old `src/main.tsx` removed (optional)
- [ ] Old `src/app/App.tsx` removed (optional)
- [ ] Old `index.html` removed (optional)
- [ ] Unused dependencies removed from `package.json`

## Documentation

- [ ] README.md updated
- [ ] Migration docs reviewed
- [ ] Team notified of changes
- [ ] Deployment docs updated (if applicable)

## Final Checks

- [ ] All tests pass (if you have tests)
- [ ] No console errors in production
- [ ] All environment variables documented
- [ ] Git commit with migration changes
- [ ] Deployment pipeline updated (if applicable)

---

## Sign Off

- **Migrated by**: _______________
- **Date**: _______________
- **Verified by**: _______________
- **Date**: _______________

## Notes

_Add any additional notes or issues encountered during migration:_

---

If all items are checked, the migration is complete! 🎉
