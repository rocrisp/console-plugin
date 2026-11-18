# Agent Shortcut Notes

Primary instructions live in `AGENTS.md`.

## Shortcut: deploy from feature branch and test

When requested, dispatch the **Build, push to Quay, and deploy** GitHub workflow with:

- `source_ref=<current feature branch>` (unless user specifies another branch)
- `image_repository=quay.io/rocrisp/partner-labs-console-plugin` (unless overridden)
- `release_name=partner-labs-console-plugin` (unless overridden)
- `namespace=partner-labs-console-plugin` (unless overridden)

Example:
- If current branch is `feat/cookbook-labeling-cleanup`, then deploy that branch to namespace `partner-labs-console-plugin`.
