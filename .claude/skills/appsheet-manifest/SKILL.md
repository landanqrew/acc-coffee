---
name: appsheet-manifest
description: Explore and query AppSheet application manifests using the manifest-cli tool. Use when working with AppSheet apps, answering questions about app structure, tables, actions, automations, security, or expressions.
---

# AppSheet Manifest Explorer

Use the globally installed `manifest-cli` to explore AppSheet application manifests. This is the primary tool for understanding any AppSheet app's structure, behavior, and logic.

## Setup

`manifest-cli` is installed globally. It accepts either:
- An **absolute path** (or path with `/`) to a folder containing `appManifest.json`
- A **bare folder name** resolved against `APPSHEET_APPS_DIR` env var (defaults to `./applications/`)

```bash
# Absolute path — works from anywhere
manifest-cli /path/to/my/app summary

# Bare name — resolves against APPSHEET_APPS_DIR or ./applications/
manifest-cli DNA_App summary
```

## Workflow

### 1. Orient — understand the app's scale

```bash
manifest-cli <app> summary
```

Returns counts of tables, actions, bots, views, etc. This tells you how complex the app is and where to focus.

### 2. Explore structure

```bash
manifest-cli <app> tables                    # all tables
manifest-cli <app> tables --provider database  # only real data tables
manifest-cli <app> relationships              # how tables connect
manifest-cli <app> table <name>               # deep dive into one table
```

### 3. Understand behavior

```bash
manifest-cli <app> actions --table <t>        # actions on a table
manifest-cli <app> resolve-composite <name>   # flatten grouped action tree
manifest-cli <app> bots                        # automation bots
manifest-cli <app> bot-chain <name>           # full bot → event → process pipeline
```

### 4. Investigate logic

```bash
manifest-cli <app> computed-columns            # all columns with formulas
manifest-cli <app> computed-columns --table <t> # formulas on one table
manifest-cli <app> search "USEREMAIL"          # regex across ALL expressions
manifest-cli <app> security                    # tables with row/write security
```

## Command Reference

| Command | Options | Returns |
|---------|---------|---------|
| `summary` | — | Object counts |
| `tables` | `--provider <p>` | All tables. Filter: `database` or `native` |
| `table <name>` | — | Single table with all columns, keys, filters, security |
| `columns <table>` | — | Columns for a table |
| `relationships` | `--table <t>` | FK relationships |
| `actions` | `--table <t>` `--type <t>` | Actions. Filter by table or type |
| `action <name>` | — | Single action detail |
| `resolve-composite <name>` | — | Flatten composite action into leaf actions |
| `action-type-counts` | — | Actions grouped by type |
| `slices` | `--source-table <t>` | Slices (filtered table subsets) |
| `bots` | `--include-disabled` | Automation bots |
| `bot-chain <name>` | — | Bot → event → process chain |
| `events` | `--type <t>` | Events (Change, Scheduled) |
| `processes` | — | Processes with node trees |
| `tasks` | `--type <t>` | Tasks (email, webhook) |
| `views` | `--table <t>` `--type <t>` | Views (deck, form, detail, etc.) |
| `format-rules` | `--table <t>` `--include-disabled` | Format rules with styles |
| `security` | — | Tables with security expressions |
| `computed-columns` | `--table <t>` | Columns with non-trivial formulas |
| `search <pattern>` | — | Regex across all expressions |

## Strategies for Common Questions

**"What does this app do?"**
→ `summary` → `tables --provider database` → `relationships` → `actions --type COMPOSITE` → `search "status"`

**"What columns does table X have?"**
→ `table <name>` — returns full table with columns, types, keys, formulas, constraints, ref targets.

**"Who can see/edit table X?"**
→ `security` for row filters and write expressions. `table <name>` for column-level showIf/editableIf.

Four layers: row filter (`dataFilter`) → table write (`updateModeExpression`) → column (`constraints.showIf`, `constraints.editableIf`) → view (`showIf`).

**"What actions are available on table X?"**
→ `actions --table <name>`. For grouped actions: `resolve-composite <name>`.

**"How are tables related?"**
→ `relationships`. Filter with `--table` for one table. Shows fromTable, fromColumn, toTable, toKeyColumn, isAPartOf.

**"How do automations work?"**
→ `bots` → `bot-chain <name>` for the full pipeline.

**"Find all expressions referencing X"**
→ `search <pattern>` — searches column formulas, defaults, constraints, action conditions, event filters, slice filters, view ShowIf, format rules, task fields.

## Action Types

`ADD_RECORD`, `ADD_RECORD_TO`, `CALL`, `COMPOSITE`, `COPY_EDIT_ROW`, `DELETE_RECORD`, `EDIT_RECORD`, `EMAIL`, `EXPORT_VIEW`, `NAVIGATE_APP`, `NAVIGATE_DIFFERENT_APP`, `NAVIGATE_URL`, `OPEN_FILE`, `REF_ACTION`, `SET_COLUMN_VALUE`, `SMS`

## Important Notes

- **Always use the CLI over raw JSON.** Manifests are 40MB+, deeply nested, with embedded JSON strings. The CLI handles all parsing.
- **Virtual columns** (`isVirtual: true`) are computed server-side, read-only via API.
- **`security_matrix`** is a table whose rows define per-role, per-table permissions. Other tables reference it in `updateModeExpression`.
- **AppSheet expressions** use their own language, not SQL. Key functions: `SELECT()`, `FILTER()`, `IN()`, `USERSETTINGS()`, `CONTEXT()`, `ANY()`, `INDEX()`, `ORDERBY()`, `TOP()`.
- All output is JSON — pipe to `jq` for further filtering.
