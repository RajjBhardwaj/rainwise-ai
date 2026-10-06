"""
reviews_service.py — persistent JSON storage for user-submitted reviews.

Reviews are stored in backend/data/reviews.json.
The file is created automatically if it does not exist.

Uses a threading.Lock so concurrent FastAPI requests are safe.
No third-party dependencies beyond the Python standard library.
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

# Path: backend/data/reviews.json
# __file__ = backend/app/services/reviews_service.py
_DATA_FILE = Path(__file__).parent.parent.parent / "data" / "reviews.json"
_lock = Lock()


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load() -> list[dict]:
    """Read and return the reviews list. Returns [] on any read/parse error."""
    if not _DATA_FILE.exists():
        return []
    try:
        content = _DATA_FILE.read_text(encoding="utf-8")
        data = json.loads(content)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save(reviews: list[dict]) -> None:
    """Write the reviews list to disk, creating parent dirs as needed."""
    _DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    _DATA_FILE.write_text(
        json.dumps(reviews, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_reviews() -> list[dict]:
    """Return all reviews, newest first."""
    with _lock:
        reviews = _load()
    # Sort newest-first by created_at (ISO strings sort lexicographically)
    reviews.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return reviews


def add_review(
    *,
    name: str,
    message: str,
    rating: int,
    location: str = "",
) -> dict:
    """
    Append a new review to the JSON store and return it.

    Parameters are keyword-only to prevent accidental positional mismatches.
    """
    review = {
        "id": str(uuid.uuid4()),
        "name": name.strip(),
        "location": location.strip(),
        "rating": int(rating),
        "message": message.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    with _lock:
        reviews = _load()
        reviews.append(review)
        _save(reviews)
    return review
