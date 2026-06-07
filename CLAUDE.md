# acc-coffee

## AGENTS Protocol

In addition to this doc, reference the AGENTS.md at project root

<!-- BEGIN:nextjs-agent-rules -->
### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues are tracked as GitHub Issues on landanqrew/acc-coffee via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default canonical label names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Rules

- never include `co-authored-by` or `Generated with...` lines in git commits, PR comments or PR descriptions.
