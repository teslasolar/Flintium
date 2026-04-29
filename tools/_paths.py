"""Build artifacts shared across builders."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "pages" / "data"
DIST_DIR = ROOT / "dist"
PROJECT_NAME = "Flintium"
TIMESTAMP = "2026-04-29T00:00:00Z"
