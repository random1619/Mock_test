"""
classify_mocks.py
-----------------
Classifies HTML mock/test files by their source (Oliveboard, English Madhyam, etc.)
and moves them into organised sub-folders.

Usage:
    python classify_mocks.py                        # scans current directory
    python classify_mocks.py --src /path/to/mocks   # custom source directory
    python classify_mocks.py --src ./mocks --out ./sorted --copy   # copy instead of move
    python classify_mocks.py --dry-run              # preview without touching files

Requirements:
    pip install beautifulsoup4
"""

import os
import re
import shutil
import argparse
from pathlib import Path
from bs4 import BeautifulSoup


# ──────────────────────────────────────────────────────────────────────────────
# SOURCE DETECTION RULES
# Each entry: (folder_name, [list of keyword/regex patterns])
# Patterns are matched case-insensitively against:
#   title, meta tags, body text, URLs, script/link src, class/id names
# The FIRST matching rule wins — put more specific rules first.
# Add your own rules at the bottom of this list.
# ──────────────────────────────────────────────────────────────────────────────
SOURCE_RULES = [
    ("Oliveboard",       ["oliveboard"]),
    ("English_Madhyam",  ["english.?madhyam", "englishmadhyam"]),
    ("Testbook",         ["testbook"]),
    ("Adda247",          ["adda247"]),
    ("Gradeup_PW",       ["gradeup", r"pw\.live", "physicswallah", "physics.?wallah"]),
    ("AffairsCloud",     ["affairscloud"]),
    ("Cracku",           ["cracku"]),
    ("Byju",             [r"byjus\.com", "byju"]),
    ("Unacademy",        ["unacademy"]),
    ("Exam_Pundit",      ["exampundit"]),
    ("Mahendras",        ["mahendras"]),
    ("Smart_Keeda",      ["smartkeeda"]),
    ("Examsdaily",       ["examsdaily"]),
    ("BankersAdda",      ["bankersadda"]),
    ("Career_Power",     ["careerpower", "career.?power"]),
    ("SSCAdda",          ["sscadda"]),
    ("Jagran_Josh",      ["jagranjosh"]),
    ("StudyIQ",          ["studyiq"]),
    ("Reasoning_Raju",   ["reasoning.?raju"]),
]

UNKNOWN_FOLDER = "Unknown_Source"


def extract_signals(soup: BeautifulSoup, raw_html: str) -> str:
    """
    Collects every piece of text / attribute that might reveal the source:
      - <title> text
      - <meta> name / content / property values
      - All href / src / data-src attribute values  (catches CDN domains, logos)
      - All class names and element ids
      - Visible body text (first 8 KB)
      - First 5 KB of raw HTML  (catches inline JS strings / HTML comments)
    Returns one lowercase string for simple regex matching.
    """
    parts = []

    # <title>
    if soup.title and soup.title.string:
        parts.append(soup.title.string)

    # <meta ...>
    for meta in soup.find_all("meta"):
        for attr in ("name", "content", "property", "description", "author"):
            val = meta.get(attr, "")
            if val:
                parts.append(val)

    # href / src attributes across all tags
    for tag in soup.find_all(True):
        for attr in ("href", "src", "action", "data-src", "data-url"):
            val = tag.get(attr, "")
            if val:
                parts.append(val)

    # class names and ids
    for tag in soup.find_all(True):
        classes = " ".join(tag.get("class", []))
        tag_id  = tag.get("id", "")
        if classes:
            parts.append(classes)
        if tag_id:
            parts.append(tag_id)

    # Visible text (first 8 KB is enough for headers / watermarks)
    body_text = soup.get_text(separator=" ", strip=True)
    parts.append(body_text[:8000])

    # Raw HTML head for inline JS / comments
    parts.append(raw_html[:5000])

    return " ".join(parts).lower()


def detect_source(signals: str) -> str:
    """Return the matching source folder name, or UNKNOWN_FOLDER."""
    for folder_name, patterns in SOURCE_RULES:
        for pattern in patterns:
            if re.search(pattern, signals, re.IGNORECASE):
                return folder_name
    return UNKNOWN_FOLDER


def classify_files(src_dir: Path, out_dir: Path, copy_mode: bool, dry_run: bool):
    html_files = sorted(src_dir.glob("*.html")) + sorted(src_dir.glob("*.htm"))

    if not html_files:
        print(f"[!] No HTML / HTM files found in: {src_dir}")
        return

    mode_label = "DRY RUN — " if dry_run else ""
    action     = "COPY" if copy_mode else "MOVE"
    print(f"\n{mode_label}Found {len(html_files)} HTML file(s) in: {src_dir}\n")

    summary: dict[str, list[str]] = {}

    for file_path in html_files:
        try:
            raw_html = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as exc:
            print(f"  [ERROR] Cannot read {file_path.name}: {exc}")
            continue

        soup    = BeautifulSoup(raw_html, "html.parser")
        signals = extract_signals(soup, raw_html)
        source  = detect_source(signals)

        dest_folder = out_dir / source
        dest_file   = dest_folder / file_path.name
        summary.setdefault(source, []).append(file_path.name)

        print(f"  [{action}] {file_path.name:<55s} → {source}/")

        if not dry_run:
            dest_folder.mkdir(parents=True, exist_ok=True)
            if copy_mode:
                shutil.copy2(file_path, dest_file)
            else:
                shutil.move(str(file_path), dest_file)

    # ── Summary report ────────────────────────────────────────────────────────
    print("\n" + "─" * 65)
    print("SUMMARY")
    print("─" * 65)
    for source, files in sorted(summary.items()):
        icon = "📁" if source != UNKNOWN_FOLDER else "❓"
        print(f"\n  {icon} {source}/  ({len(files)} file{'s' if len(files) != 1 else ''})")
        for f in files:
            print(f"       {f}")

    if dry_run:
        print("\n⚠️  DRY RUN complete — no files were touched.")
        print("    Remove --dry-run to actually move / copy files.\n")
    else:
        print(f"\n✅  Done!  Files organised under: {out_dir}\n")

    unknown = summary.get(UNKNOWN_FOLDER, [])
    if unknown:
        print(
            f"💡  {len(unknown)} file(s) landed in '{UNKNOWN_FOLDER}/'.\n"
            "    Open classify_mocks.py and add their source keyword to SOURCE_RULES.\n"
        )


def main():
    parser = argparse.ArgumentParser(
        description="Classify HTML mock/test files by source and organise into sub-folders.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python classify_mocks.py
  python classify_mocks.py --src ~/Downloads/mocks
  python classify_mocks.py --src ./mocks --out ./sorted --copy
  python classify_mocks.py --src ./mocks --dry-run
        """
    )
    parser.add_argument(
        "--src", default=".",
        help="Folder containing HTML mock files  (default: current directory)"
    )
    parser.add_argument(
        "--out", default=None,
        help="Root output folder for sorted sub-folders  (default: same as --src)"
    )
    parser.add_argument(
        "--copy", action="store_true",
        help="Copy files instead of moving them (keeps originals in place)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Preview classifications without moving or copying anything"
    )
    args = parser.parse_args()

    src_dir = Path(args.src).resolve()
    out_dir = Path(args.out).resolve() if args.out else src_dir

    if not src_dir.exists():
        print(f"[ERROR] Source directory not found: {src_dir}")
        return

    classify_files(src_dir, out_dir, copy_mode=args.copy, dry_run=args.dry_run)


if __name__ == "__main__":
    main()