# React Error Fixes

## Error: Cannot update a component while rendering a different component

### Error Message
```
Cannot update a component (`Workspace`) while rendering a different component (`IssueDetail`). 
To locate the bad setState() call inside `IssueDetail`, follow the stack trace.
```

### Location
- **File:** `src/app/components/IssueDetail.tsx`
- **Line:** 63 (inside useEffect)
- **Component:** IssueDetail

### Root Cause

The error occurred because `onUpdate()` (a parent state setter) was being called **inside** a `setState` callback:

```tsx
// ❌ WRONG - Calling parent update inside setState
setCurrentIssue((prev) => {
  const updated = { ...prev, linked_prs: prs };
  onUpdate(updated);  // ❌ This causes the error!
  return updated;
});
```

**Why this is wrong:**
1. React is in the middle of rendering `IssueDetail`
2. Inside the state setter, we call `onUpdate(updated)`
3. `onUpdate` triggers a state change in the parent `Workspace` component
4. React tries to re-render `Workspace` while still rendering `IssueDetail`
5. This violates React's rendering rules

### The Fix

Move the parent callback **outside** the state setter:

```tsx
// ✅ CORRECT - Call parent update after setState
const updated = { ...currentIssue, linked_prs: prs };
setCurrentIssue(updated);
onUpdate(updated);  // ✅ Called after, not during setState
```

### Code Changes

**Before (Broken):**
```tsx
useEffect(() => {
  setLoadingPRs(true);
  githubApi
    .getLinkedPRs(currentIssue.repository.full_name, currentIssue.number)
    .then((prs) => {
      setCurrentIssue((prev) => {
        const updated = { ...prev, linked_prs: prs };
        onUpdate(updated);  // ❌ Inside setState
        return updated;
      });
    })
    .catch(() => {})
    .finally(() => setLoadingPRs(false));
}, [currentIssue.repository.full_name, currentIssue.number]);
```

**After (Fixed):**
```tsx
useEffect(() => {
  setLoadingPRs(true);
  githubApi
    .getLinkedPRs(currentIssue.repository.full_name, currentIssue.number)
    .then((prs) => {
      const updated = { ...currentIssue, linked_prs: prs };
      setCurrentIssue(updated);  // ✅ Set state first
      onUpdate(updated);         // ✅ Then call parent callback
    })
    .catch(() => {})
    .finally(() => setLoadingPRs(false));
}, [currentIssue.repository.full_name, currentIssue.number]);
```

### Why This Works

1. **State update happens first:** `setCurrentIssue(updated)` schedules a re-render
2. **Parent callback happens after:** `onUpdate(updated)` is called in the promise chain, not during render
3. **React can batch updates:** Both updates can be batched together safely
4. **No render conflicts:** Parent and child updates don't interfere

### React Rules Violated

This error occurs when violating React's fundamental rule:

> **Never call setState (or any state-updating function) during render**

**During render includes:**
- Inside the component body (before return)
- Inside `setState` callbacks
- Inside `useMemo` or `useCallback` bodies
- During the initial render phase

**Safe places to call setState:**
- Inside event handlers
- Inside `useEffect` callbacks
- Inside promise `.then()` callbacks (outside setState)
- Inside `setTimeout` or `setInterval` callbacks

### Similar Patterns to Avoid

```tsx
// ❌ BAD - Calling parent callback inside setState
setState((prev) => {
  const next = computeNext(prev);
  onParentUpdate(next);  // ❌ Don't do this
  return next;
});

// ✅ GOOD - Call parent callback after setState
const next = computeNext(state);
setState(next);
onParentUpdate(next);  // ✅ Do this instead

// ✅ ALSO GOOD - Use useEffect to sync
useEffect(() => {
  onParentUpdate(state);
}, [state, onParentUpdate]);
```

### Testing the Fix

1. ✅ Navigate to workspace
2. ✅ Select an issue
3. ✅ Issue detail panel opens
4. ✅ Linked PRs load without error
5. ✅ No console errors
6. ✅ Parent component updates correctly

### Related Issues Checked

Searched for similar patterns in the codebase:
- ✅ `RepositorySidebar.tsx` - Safe (no parent callbacks in setState)
- ✅ `IssueList.tsx` - Safe (no parent callbacks in setState)
- ✅ Other components - No similar issues found

### Prevention

**Best Practices:**
1. Never call props callbacks inside `setState` updater functions
2. If you need to notify parent after state change, use `useEffect`
3. Or call the callback after `setState`, not inside it
4. Use ESLint rules to catch these issues early

**ESLint Rule:**
```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### References

- [React Docs: setState in render](https://react.dev/link/setstate-in-render)
- [React Rules: Don't call Hooks inside callbacks](https://react.dev/reference/rules/react-calls-components-and-hooks)

---

**Status:** ✅ Fixed  
**Date:** 2026-02-28  
**Verified:** No console errors, component updates work correctly
