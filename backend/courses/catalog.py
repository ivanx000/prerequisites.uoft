import json
import re
from urllib import parse, request

# Matches UofT course codes like CSC148H1, MAT237Y1, ECE344H1
_COURSE_CODE_RE = re.compile(r'\b[A-Z]{2,4}\d{3}[HY]\d\b')


def _fetch_json(url, timeout=4):
    req = request.Request(url, headers={'User-Agent': 'UofTree/1.0'})
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode('utf-8'))


def extract_prerequisite_codes(text):
    """
    Parse a free-text prerequisite string and return the list of course codes
    found within it.  E.g. "CSC148H1 or CSC150H1" → ['CSC148H1', 'CSC150H1'].
    """
    if not text:
        return []
    return _COURSE_CODE_RE.findall(text.upper())


def _normalize_course(code, payload):
    if not isinstance(payload, dict):
        return None

    normalized_code = (payload.get('code') or code or '').strip().upper()
    if not normalized_code:
        return None

    name = (
        payload.get('name')
        or payload.get('title')
        or payload.get('courseTitle')
        or 'Untitled Course'
    ).strip()

    description = (
        payload.get('description')
        or payload.get('courseDescription')
        or ''
    ).strip()

    # The UofT timetable API stores prerequisites as a free-text field.
    # We extract any course codes we can find in that text.
    prereq_text = (
        payload.get('prerequisite')
        or payload.get('prerequisites')
        or payload.get('prerequisiteDescription')
        or payload.get('prereqDescription')
        or ''
    ).strip()

    return {
        'code': normalized_code,
        'name': name,
        'description': description,
        'prerequisite_codes': extract_prerequisite_codes(prereq_text),
    }


def search_timetable_courses(query, session, timeout=4, limit=25):
    """
    Search the UofT timetable API and return normalized course dicts.
    """
    q = (query or '').strip().upper()
    if not q:
        return []

    encoded = parse.urlencode({'code': q})
    url = f'https://timetable.iit.artsci.utoronto.ca/api/{session}/courses?{encoded}'
    data = _fetch_json(url, timeout=timeout)

    results = []
    for code, payload in (data or {}).items():
        normalized = _normalize_course(code, payload)
        if not normalized:
            continue
        if q in normalized['code'] or q in normalized['name'].upper():
            results.append(normalized)

    results.sort(key=lambda c: c['code'])
    return results[:limit]


def fetch_timetable_course_by_code(code, session, timeout=4):
    """
    Fetch a single course by exact code from the UofT timetable API.
    """
    target = (code or '').strip().upper()
    if not target:
        return None

    encoded = parse.urlencode({'code': target})
    url = f'https://timetable.iit.artsci.utoronto.ca/api/{session}/courses?{encoded}'
    data = _fetch_json(url, timeout=timeout)

    for key, payload in (data or {}).items():
        normalized = _normalize_course(key, payload)
        if normalized and normalized['code'] == target:
            return normalized

    return None


def fetch_timetable_courses_by_prefix(dept_prefix, session, timeout=10):
    """
    Fetch all courses matching a department prefix (e.g. 'CSC', 'MAT').
    Returns the raw API payload dict keyed by course code so callers can
    normalise themselves and avoid double network round-trips.
    """
    prefix = (dept_prefix or '').strip().upper()
    if not prefix:
        return {}

    encoded = parse.urlencode({'code': prefix})
    url = f'https://timetable.iit.artsci.utoronto.ca/api/{session}/courses?{encoded}'
    try:
        return _fetch_json(url, timeout=timeout) or {}
    except Exception:
        return {}
