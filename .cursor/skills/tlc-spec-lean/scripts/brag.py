#!/usr/bin/env python3
"""
brag.py - deterministic bookkeeping for the tlc-spec-lean brag layer.

After a feature's Verifier PASSes (`validate_verification.py` exit 0), record one
grounded outcome entry so a personal brag / weekly status can be built from
spec evidence instead of reconstructed from git noise later.

The LLM supplies judgment (one-sentence outcome, optional tags). This script owns
IDs, dedup by feature, timestamps, and rendering. Hand-kept brag files rot the
same way hand-kept lessons do.

Canonical state:  .specs/brag.json   (machine-owned - do NOT hand-edit)
Rendered view:    .specs/BRAG.md     (regenerated on every write)

Pure standard library. Invoke as:
  python3 <skill-dir>/scripts/brag.py --root <project> <command> ...

Commands:
  init     Create empty store + rendered file
  add      Record (or refresh) one entry for a verified feature
  list     Print entries (newest first)
  render   Rewrite BRAG.md from the store
  status   Print counts
  week     Print entries whose verified_at falls in a date window
  selftest Run stdlib regressions

Exit codes: 0 ok, 2 usage/validation error.
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import sys
import unicodedata

STORE_REL = os.path.join(".specs", "brag.json")
RENDER_REL = os.path.join(".specs", "BRAG.md")

SCHEMA = 1


def _now():
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_iso(s: str) -> _dt.datetime:
    s = (s or "").strip()
    for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d"):
        try:
            d = _dt.datetime.strptime(s, fmt)
            if d.tzinfo is None:
                d = d.replace(tzinfo=_dt.timezone.utc)
            return d
        except ValueError:
            continue
    raise ValueError(f"invalid date: {s!r} (want YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ)")


def _store_path(root):
    return os.path.join(root, STORE_REL)


def _render_path(root):
    return os.path.join(root, RENDER_REL)


def _empty():
    return {"schema": SCHEMA, "next_id": 1, "entries": []}


def _load(root):
    path = _store_path(root)
    if not os.path.exists(path):
        return _empty()
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("schema", SCHEMA)
    data.setdefault("next_id", 1)
    data.setdefault("entries", [])
    return data


def _save(root, data):
    os.makedirs(os.path.join(root, ".specs"), exist_ok=True)
    with open(_store_path(root), "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    _render(root, data)


def _norm_feature(feature: str) -> str:
    t = unicodedata.normalize("NFD", feature.casefold())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-z0-9._/-]+", "-", t).strip("-")
    return t


def _find_feature(data, feature: str):
    key = _norm_feature(feature)
    for e in data["entries"]:
        if _norm_feature(e.get("feature", "")) == key:
            return e
    return None


def _tags_list(raw: str):
    if not raw:
        return []
    out = []
    for part in re.split(r"[,;\s]+", raw.strip()):
        p = part.strip().lstrip("#")
        if p and p not in out:
            out.append(p)
    return out


def _render(root, data):
    lines = []
    lines.append("# BRAG - auto-maintained by scripts/brag.py")
    lines.append("")
    lines.append("> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `brag.py` write.")
    lines.append("> Canonical state lives in `.specs/brag.json`. Edit entries only via the script.")
    lines.append("> Source of truth for each row: a Verifier PASS (`validate_verification.py` exit 0).")
    lines.append("")

    entries = sorted(
        data["entries"],
        key=lambda e: e.get("verified_at") or e.get("updated_at") or "",
        reverse=True,
    )
    if not entries:
        lines.append("_none yet — entries appear after a feature Verifier PASSes_")
        lines.append("")
    else:
        lines.append(f"## Entries ({len(entries)})")
        lines.append("")
        for e in entries:
            tags = e.get("tags") or []
            tag_s = (" · " + " ".join(f"`{t}`" for t in tags)) if tags else ""
            lines.append(f"### {e['id']} — {e['feature']}")
            lines.append("")
            lines.append(e.get("outcome", "").strip() or "_(no outcome text)_")
            lines.append("")
            lines.append(
                f"- verified: `{e.get('verified_at', '-')}` · profile: `{e.get('profile', '-')}`"
                f" · checks: `{e.get('checks', '-')}`{tag_s}"
            )
            if e.get("diff_range"):
                lines.append(f"- diff: `{e['diff_range']}`")
            if e.get("pr"):
                lines.append(f"- pr: {e['pr']}")
            if e.get("evidence"):
                lines.append(f"- evidence: `{e['evidence']}`")
            lines.append(f"- path: `.specs/features/{e['feature']}/`")
            lines.append("")

        lines.append("## Reuso rápido")
        lines.append("")
        lines.append("Roll up a window with:")
        lines.append("")
        lines.append("```bash")
        lines.append("python3 <skill-dir>/scripts/brag.py --root . week --from YYYY-MM-DD --to YYYY-MM-DD")
        lines.append("```")
        lines.append("")

    with open(_render_path(root), "w", encoding="utf-8") as f:
        f.write("\n".join(lines).rstrip() + "\n")


def cmd_init(root, args):
    data = _load(root)
    _save(root, data)
    print(f"Initialized brag store at {_store_path(root)} and {_render_path(root)}")
    return 0


def cmd_add(root, args):
    feature = (args.feature or "").strip()
    outcome = (args.outcome or "").strip()
    evidence = (args.evidence or "").strip()
    if not feature:
        print("ERROR: --feature is required (feature folder under .specs/features/).", file=sys.stderr)
        return 2
    if len(outcome) < 12:
        print(
            "ERROR: --outcome too short. One sentence: what shipped and why it matters.",
            file=sys.stderr,
        )
        return 2
    if not evidence:
        print(
            "ERROR: --evidence is required (path into verification.md, e.g. verification.md#Gate or file:line).",
            file=sys.stderr,
        )
        print(
            "       A brag row with no Verifier grounding is a diary entry, not a brag. Refused.",
            file=sys.stderr,
        )
        return 2

    verified_at = (args.verified_at or "").strip() or _now()
    try:
        _parse_iso(verified_at if "T" in verified_at else verified_at)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    data = _load(root)
    existing = _find_feature(data, feature)
    now = _now()
    tags = _tags_list(args.tags or "")

    payload = {
        "feature": feature,
        "outcome": outcome,
        "evidence": evidence,
        "verified_at": verified_at if "T" in verified_at else f"{verified_at}T00:00:00Z",
        "profile": (args.profile or "").strip(),
        "checks": (args.checks or "").strip(),
        "diff_range": (args.diff_range or "").strip(),
        "pr": (args.pr or "").strip(),
        "tags": tags,
        "updated_at": now,
    }

    if existing:
        for k, v in payload.items():
            if k == "tags":
                # merge tags, keep order
                merged = list(existing.get("tags") or [])
                for t in v:
                    if t not in merged:
                        merged.append(t)
                existing["tags"] = merged
            elif v or k in ("outcome", "evidence", "feature", "verified_at", "updated_at"):
                existing[k] = v
        _save(root, data)
        print(f"UPDATED {existing['id']} (feature={existing['feature']})")
    else:
        bid = f"B-{data['next_id']:03d}"
        data["next_id"] += 1
        entry = {"id": bid, "created_at": now, **payload}
        data["entries"].append(entry)
        _save(root, data)
        print(f"ADDED {bid} (feature={feature})")
    return 0


def cmd_list(root, args):
    data = _load(root)
    rows = list(data["entries"])
    tag = (args.tag or "").strip().lstrip("#").lower()
    q = (args.query or "").lower().strip()
    if tag:
        rows = [e for e in rows if tag in [t.lower() for t in (e.get("tags") or [])]]
    if q:
        rows = [
            e
            for e in rows
            if q in (e.get("outcome") or "").lower() or q in (e.get("feature") or "").lower()
        ]
    rows.sort(key=lambda e: e.get("verified_at") or "", reverse=True)
    if not rows:
        print("(no brag entries" + (f" matching filter" if (tag or q) else "") + ")")
        return 0
    for e in rows:
        tags = ",".join(e.get("tags") or []) or "-"
        print(
            f"{e['id']} [{e.get('verified_at','-')[:10]}] {e['feature']}: {e.get('outcome','')} (tags:{tags})"
        )
    return 0


def cmd_week(root, args):
    data = _load(root)
    try:
        start = _parse_iso(args.start)
        end = _parse_iso(args.end)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2
    if end.tzinfo is None:
        end = end.replace(tzinfo=_dt.timezone.utc)
    # inclusive end-of-day if date-only
    if len(args.end.strip()) == 10:
        end = end + _dt.timedelta(days=1) - _dt.timedelta(seconds=1)

    rows = []
    for e in data["entries"]:
        try:
            ts = _parse_iso(e.get("verified_at") or e.get("created_at") or "")
        except ValueError:
            continue
        if start <= ts <= end:
            rows.append(e)
    rows.sort(key=lambda e: e.get("verified_at") or "", reverse=True)

    print(f"# Brag window {args.start} → {args.end}")
    print()
    if not rows:
        print("_nenhuma feature verificada nesta janela_")
        return 0
    print("## Em uma frase")
    if len(rows) == 1:
        print(rows[0].get("outcome", ""))
    else:
        print(
            f"{len(rows)} features verificadas: "
            + "; ".join(e["feature"] for e in rows[:5])
            + ("…" if len(rows) > 5 else "")
        )
    print()
    print("## Feito (com prova)")
    for e in rows:
        pr = f" · {e['pr']}" if e.get("pr") else ""
        checks = f" · checks {e['checks']}" if e.get("checks") else ""
        print(f"- **{e['feature']}** — {e.get('outcome','')}{checks}{pr}")
    print()
    print(f"Fonte: `.specs/brag.json` ({len(rows)} entries)")
    return 0


def cmd_render(root, args):
    data = _load(root)
    _render(root, data)
    print(f"Rendered {_render_path(root)}")
    return 0


def cmd_status(root, args):
    data = _load(root)
    print(f"brag: {len(data['entries'])} entries | next_id={data['next_id']}")
    return 0


def _selftest():
    failures = []

    def check(cond, msg):
        if not cond:
            failures.append(msg)

    check(_norm_feature("Purge Multicolor") == "purge-multicolor", "norm feature ascii")
    check(_norm_feature("mão-na-massa") == "mao-na-massa", "norm feature diacritics")
    check(_tags_list("calc, purge; ux") == ["calc", "purge", "ux"], "tags split")

    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        root = tmp
        assert cmd_init(root, argparse.Namespace()) == 0
        rc = cmd_add(
            root,
            argparse.Namespace(
                feature="purge-optional-field",
                outcome="Optional purge cost on multi-color prints, verified end-to-end.",
                evidence="verification.md#Gate",
                verified_at="2026-10-29",
                profile="light",
                checks="8/8",
                diff_range="abc..def",
                pr="https://github.com/pablorgds/3d-calc/pull/7",
                tags="calc,purge",
            ),
        )
        check(rc == 0, f"add rc={rc}")
        data = _load(root)
        check(len(data["entries"]) == 1, "one entry")
        check(data["entries"][0]["id"] == "B-001", "id B-001")
        # refresh same feature
        rc = cmd_add(
            root,
            argparse.Namespace(
                feature="purge-optional-field",
                outcome="Optional purge cost on multi-color prints, verified end-to-end.",
                evidence="verification.md#Gate",
                verified_at="2026-10-29T12:00:00Z",
                profile="light",
                checks="8/8",
                diff_range="abc..def",
                pr="https://github.com/pablorgds/3d-calc/pull/7",
                tags="ux",
            ),
        )
        check(rc == 0, "update rc")
        data = _load(root)
        check(len(data["entries"]) == 1, "still one entry after update")
        check("ux" in data["entries"][0]["tags"], "merged tags")
        # grounding gate
        rc = cmd_add(
            root,
            argparse.Namespace(
                feature="other",
                outcome="Something shipped that mattered a lot.",
                evidence="",
                verified_at="",
                profile="",
                checks="",
                diff_range="",
                pr="",
                tags="",
            ),
        )
        check(rc == 2, "refuse empty evidence")
        # week window
        ns = argparse.Namespace(start="2026-10-27", end="2026-11-03")
        # capture week output lightly
        check(cmd_week(root, ns) == 0, "week ok")

    if failures:
        for f in failures:
            print(f"FAIL: {f}", file=sys.stderr)
        return 1
    print("selftest: ok")
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(
        prog="brag.py", description="Deterministic brag bookkeeping for tlc-spec-lean."
    )
    p.add_argument("--root", default=".", help="Project root containing .specs/ (default: cwd)")
    sub = p.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("init", help="Create empty store + rendered file")
    sp.set_defaults(fn=cmd_init)

    sp = sub.add_parser("add", help="Record a grounded brag entry after Verifier PASS")
    sp.add_argument("--feature", required=True)
    sp.add_argument("--outcome", required=True, help="One sentence: what shipped / why it matters")
    sp.add_argument("--evidence", required=True, help="verification.md anchor / Gate line")
    sp.add_argument("--verified_at", default="", help="YYYY-MM-DD or ISO UTC (default: now)")
    sp.add_argument("--profile", default="")
    sp.add_argument("--checks", default="", help="e.g. 12/12")
    sp.add_argument("--diff-range", dest="diff_range", default="")
    sp.add_argument("--pr", default="", help="PR URL if any")
    sp.add_argument("--tags", default="", help="Comma/space separated tags")
    sp.set_defaults(fn=cmd_add)

    sp = sub.add_parser("list", help="Print brag entries")
    sp.add_argument("--tag", default="")
    sp.add_argument("--query", default="")
    sp.set_defaults(fn=cmd_list)

    sp = sub.add_parser("week", help="Roll up entries in a date window (status-ready)")
    sp.add_argument("--from", dest="start", required=True)
    sp.add_argument("--to", dest="end", required=True)
    sp.set_defaults(fn=cmd_week)

    sp = sub.add_parser("render", help="Rewrite BRAG.md from the store")
    sp.set_defaults(fn=cmd_render)

    sp = sub.add_parser("status", help="Print counts")
    sp.set_defaults(fn=cmd_status)

    sp = sub.add_parser("selftest", help="Run stdlib regressions")
    sp.set_defaults(fn=lambda root, args: _selftest())

    args = p.parse_args(argv)
    root = os.path.abspath(args.root)
    return args.fn(root, args)


if __name__ == "__main__":
    raise SystemExit(main())
