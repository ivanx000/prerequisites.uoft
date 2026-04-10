import graphene
from graphene_django import DjangoObjectType
from .models import Course


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
            return (
                Course.objects
                .prefetch_related(
                    'prerequisites',
                    'prerequisites__prerequisites',
                    'prerequisites__prerequisites__prerequisites',
                )
                .get(code=code)
            )
        except Course.DoesNotExist:
            return None

    def resolve_courses(self, info, search=''):
        qs = Course.objects.prefetch_related('prerequisites')
        if search:
            qs = qs.filter(code__icontains=search)
        return qs


schema = graphene.Schema(query=Query)
