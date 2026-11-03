# Brag layer (tlc-spec-lean improvement)

Parallel to [memory.md](memory.md) lessons: **you supply judgment**, `scripts/brag.py` owns bookkeeping.

| File | Owner |
| --- | --- |
| `.specs/brag.json` | script — canonical state, never hand-edit |
| `.specs/BRAG.md` | script — rendered playbook, read it, never write it |

## Write — only after Verifier PASS

Gate: `python3 <skill-dir>/scripts/validate_verification.py <feature>` exits **0**.

Walk the just-written `verification.md` and record **one** entry:

```bash
python3 <skill-dir>/scripts/brag.py --root . add \
  --feature "<feature folder>" \
  --outcome "<one general sentence: what shipped / user impact>" \
  --evidence "verification.md#Gate" \
  --verified_at "<date from report or today>" \
  --profile "<Profile line>" \
  --checks "<proven/total>" \
  --diff-range "<Diff range>" \
  --pr "<html URL if merged/opened>" \
  --tags "<area tags>"
```

### Phrasing rules

- Outcome = product/result language, not commit noise.  
  Good: `"Optional purge cost on multi-color prints, with Vercel build unblocked."`  
  Bad: `"Merged PR #7 and #9."`
- One feature → one row. Re-running `add` for the same feature **updates** the row.
- Tags are optional retrieval aids (`calc`, `billing`, `ux`), not a second taxonomy.

### What not to record

- FAIL / partial verify (use lessons).
- Work that never entered Plan→Verify (use git status skill separately).
- Opinions about the workflow itself (maintainer / version bump).

## Read — weekly status, 1:1, review

```bash
python3 <skill-dir>/scripts/brag.py --root . list
python3 <skill-dir>/scripts/brag.py --root . list --tag calc
python3 <skill-dir>/scripts/brag.py --root . week --from 2026-10-27 --to 2026-11-03
```

`week` prints a status-shaped rollup. Prefer it over scraping commits when the feature used tlc-spec-lean.

## Turning it off

Delete `.specs/brag.json` and `.specs/BRAG.md` and skip the brag step. Plan → Checks → Build → Verify is unaffected.

## Degraded path (no code-execution)

Append a grounded bullet to `.specs/BRAG.md` by hand with the same fields, and say once in chat that accounting is best-effort.
