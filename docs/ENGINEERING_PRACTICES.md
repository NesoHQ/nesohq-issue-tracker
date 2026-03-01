# Engineering Practices

## Engineering Principles

- Favor clarity over cleverness.
- Keep side effects isolated.
- Prefer typed boundaries between layers.
- Keep UI, API wrapper, and mapper responsibilities separate.

## Branch and PR Workflow

1. Create a focused feature branch.
2. Keep PR scope small and reviewable.
3. Include problem statement and validation steps in PR description.
4. Update docs in the same PR when behavior changes.

## Code Quality Standards

- TypeScript strict mode is enabled in both services.
- Preserve file/module boundaries:
  - UI components do not call raw GitHub APIs directly.
  - Server actions orchestrate read/write operations.
  - Mapping layer normalizes external payloads.
- Handle async failures with explicit error messages and telemetry hooks.

## Validation Before Merge

Minimum local checks:

```bash
# Client
cd client
npx tsc --noEmit

# Server
cd ../server
npx tsc --noEmit
```

Optional checks:

- `client`: `npm run lint` (requires ESLint setup in this repo)
- `server`: `npm run lint` (if lint config is present)

## Documentation Standards

- Every docs page should include:
  - clear purpose
  - expected audience
  - concrete steps or references
- Avoid stale references; verify paths and commands.
- Prefer examples with real repo paths and routes.

## Change Management Checklist

When changing behavior, verify if updates are needed in:

- `docs/QUICKSTART.md`
- `docs/ARCHITECTURE.md`
- `docs/TECHNICAL_REFERENCE.md`
- `docs/TROUBLESHOOTING.md`

## Security and Privacy Checklist

- Never commit secrets (`.env`, access tokens).
- Keep tokens in server-managed cookies only.
- Validate redirect URIs and OAuth state.
- Avoid exposing internal errors directly in user-facing messages.

