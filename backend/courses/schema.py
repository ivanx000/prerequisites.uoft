import graphene
from graphene_django import DjangoObjectType
from django.conf import settings
from django.db.models import Q
from .models import Course
from .catalog import fetch_timetable_course_by_code, search_timetable_courses


class CourseType(DjangoObjectType):
    """
    Recursive GraphQL type for Course.

    N+1 Strategy
    ─────────────
    The root resolvers (resolve_course / resolve_courses) call
    .prefetch_related() three levels deep. Django executes exactly
    4 SQL statements total regardless of tree size. Every recursive
    call to resolve_prerequisites reads from the in-memory prefetch
    cache — no additional SQL per node.
    """

    class Meta:
        model = Course
        fields = ('id', 'code', 'name', 'description', 'prerequisites')

    prerequisites = graphene.List(lambda: CourseType)

    def resolve_prerequisites(self, info):
        # Hits the prefetch cache — O(1), no SQL
        return self.prerequisites.all()


def _prefetch_course(code):
    """Return a Course from DB with 3-level prerequisite prefetch."""
    return (
        Course.objects
        .prefetch_related(
            'prerequisites',
            'prerequisites__prerequisites',
            'prerequisites__prerequisites__prerequisites',
        )
        .get(code=code)
    )


def _save_remote_course(remote):
    """
    Persist a course dict returned by the timetable API fallback.

    • Creates the course if it doesn't exist yet (never overwrites existing
      records so manually curated data is preserved).
    • On first creation, wires up any prerequisites whose codes are already
      present in the local database.
    • Returns the db-backed Course with prerequisite prefetch applied.
    """
    course, created = Course.objects.get_or_create(
        code=remote['code'],
        defaults={
            'name': remote['name'],
            'description': remote['description'],
        },
    )

    if created:
        for prereq_code in remote.get('prerequisite_codes') or []:
            try:
                prereq = Course.objects.get(code=prereq_code)
                course.prerequisites.add(prereq)
            except Course.DoesNotExist:
                pass  # prerequisite not imported yet — skip silently

    return _prefetch_course(course.code)


class Query(graphene.ObjectType):
    course = graphene.Field(
        CourseType,
        code=graphene.String(required=True),
        description='Fetch a single course and its full recursive prerequisite tree.',
    )
    courses = graphene.List(
        CourseType,
        search=graphene.String(default_value=''),
        description='List all courses, optionally filtered by search string.',
    )

    def resolve_course(self, info, code):
        try:
            return _prefetch_course(code)
        except Course.DoesNotExist:
            if not settings.UOFT_TIMETABLE_FALLBACK_ENABLED:
                return None

            remote = fetch_timetable_course_by_code(
                code=code,
                session=settings.UOFT_TIMETABLE_SESSION,
                timeout=settings.UOFT_TIMETABLE_TIMEOUT_SECONDS,
            )
            if not remote:
                return None

            return _save_remote_course(remote)

    def resolve_courses(self, info, search=''):
        q = (search or '').strip()
        qs = Course.objects.prefetch_related('prerequisites')

        if not q:
            return qs[: settings.SEARCH_RESULTS_LIMIT]

        local_results = list(
            qs.filter(Q(code__icontains=q) | Q(name__icontains=q))[: settings.SEARCH_RESULTS_LIMIT]
        )

        if (
            len(local_results) >= settings.SEARCH_RESULTS_LIMIT
            or not settings.UOFT_TIMETABLE_FALLBACK_ENABLED
        ):
            return local_results

        seen_codes = {course.code for course in local_results}
        remote_results = search_timetable_courses(
            query=q,
            session=settings.UOFT_TIMETABLE_SESSION,
            timeout=settings.UOFT_TIMETABLE_TIMEOUT_SECONDS,
            limit=settings.SEARCH_RESULTS_LIMIT,
        )

        merged = list(local_results)
        for remote in remote_results:
            if remote['code'] in seen_codes:
                continue
            merged.append(
                Course(
                    code=remote['code'],
                    name=remote['name'],
                    description=remote['description'],
                )
            )
            if len(merged) >= settings.SEARCH_RESULTS_LIMIT:
                break

        return merged


schema = graphene.Schema(query=Query)
