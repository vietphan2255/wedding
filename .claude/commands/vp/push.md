---
description: Commit all changes with a fitting message and push to main
argument-hint: "[optional message hint]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*)
---

Commit all current changes with a fitting message and push to `main`.

## Steps

1. **Inspect the working tree** so the message reflects what actually changed:
   - `git status --short`
   - `git diff` and `git diff --staged` for the actual changes; `git diff --stat` for a summary.
   - `git log -5 --oneline` to match the repo's commit-message style.
   - If there is nothing to commit, stop and tell me — don't create an empty commit.
2. **Stage everything:** `git add -A`.
3. **Commit with a concise, fitting message:**
   - Summarize the *intent* of the change, not a file list. Follow the existing history's
     style (it uses Conventional Commits — `feat:` / `fix:` / `refactor:` / `chore:`).
   - If `$ARGUMENTS` is non-empty, use it as the basis for the message; otherwise infer it
     from the diff.
   - Put the trailer on its own paragraph by passing it as a second `-m`:
     ```
     git commit -m "<summary>" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
     ```
4. **Push to main:**
   - `git branch --show-current` to confirm the branch.
   - If on `main`: `git push origin main`.
   - If on another branch: `git push origin HEAD:main` (push the new commit onto main without
     switching branches).
   - If the push is rejected as non-fast-forward, stop and report it — do **not** force-push.
5. **Report back:** the commit hash, the one-line message, and confirmation that the push to
   `main` succeeded.
