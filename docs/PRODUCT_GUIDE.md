# Product Guide

## What This Project Is

NesOHQ Issue Tracker is a web workspace for managing GitHub issues across repositories from one interface.

It focuses on:

- Fast issue discovery
- Lightweight editing
- Clear context (labels, assignees, linked pull requests)

## Core User Workflows

### 1. Sign In

- User clicks GitHub sign-in.
- User completes OAuth consent on GitHub.
- User returns to workspace with authenticated session.

### 2. Browse Repositories

- Sidebar lists accessible repositories.
- User can search repositories.
- User can pin frequently used repositories.

### 3. Find Issues

- Filter by issue state (`open`, `closed`, `all`)
- Search issues by query
- Load additional pages of results

### 4. Create a New Issue

- Choose repository
- Enter title and body (markdown supported)
- Apply labels
- Submit issue to GitHub

### 5. Update an Existing Issue

- Edit title
- Edit description/body
- Toggle labels
- Close/Reopen issue

### 6. Review Linked Pull Requests

Linked PR statuses are shown with clear visual state:

- Open or new: green
- Failed (closed without merge): red
- Merged: purple

## Permission Model

The app uses the signed-in GitHub user's token. All visible repositories and writable actions are constrained by that user's GitHub permissions.

## Current Feature Boundaries

- Assignees are currently display-only (no assign/unassign control in UI)
- No custom issue templates
- No built-in analytics dashboard in this repo (client telemetry hooks exist)

## Primary Value

- Reduce context switching between repositories
- Keep issue triage and updates fast
- Provide a consistent editing experience over GitHub issue APIs
