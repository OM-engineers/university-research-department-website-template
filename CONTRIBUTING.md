# Contributing

1. `main` is always working. **Nobody pushes directly to `main`**: GitHub rejects it.
2. Start from the latest main: `git switch main && git pull`
3. Create a branch: `git switch -c team-x/short-description` (example `team-b/home-hero`; bug fixes `fix/BUG-07-short-name`)
4. Commit small and often, message format `type: description`
   - types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`
5. Push the branch and open a Pull Request using the template.
6. **One approval from someone else (not the author)** is required, and all conversations must be resolved. A new commit cancels the approval.
7. Merge with **Squash and merge**, then delete the branch.
8. Reference bug IDs (BUG-xx) from the Bug_Register in commits and PRs.

## If Git says "protected branch"

You committed on `main` by mistake. Nothing is lost. Run:

```bash
git switch -c team-x/short-name
git push -u origin team-x/short-name
```

Then open the Pull Request from that branch.

Never commit: `node_modules`, build output, `.env` files, passwords, or large media files.
Full guide: not included in this template.
