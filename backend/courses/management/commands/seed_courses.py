from django.core.management.base import BaseCommand
from courses.models import Course


COURSES = [
    {
        'code': 'CSC108H1',
        'name': 'Introduction to Computer Programming',
        'description': 'Basic programming concepts using Python.',
    },
    {
        'code': 'CSC148H1',
        'name': 'Introduction to Computer Science',
        'description': 'Recursion, linked lists, trees, and object-oriented design.',
    },
    {
        'code': 'MAT137Y1',
        'name': 'Calculus with Proofs',
        'description': 'Limits, derivatives, integrals, and rigorous mathematical proofs.',
    },
    {
        'code': 'CSC263H1',
        'name': 'Data Structures and Analysis',
        'description': 'Algorithm analysis and fundamental data structures including heaps, hash tables, and graphs.',
    },
    {
        'code': 'CSC373H1',
        'name': 'Algorithm Design, Analysis and Complexity',
        'description': 'Greedy algorithms, dynamic programming, and NP-completeness.',
    },
    {
        'code': 'MAT237Y1',
        'name': 'Multivariable Calculus',
        'description': 'Partial derivatives, multiple integrals, and vector calculus.',
    },
]

# Maps course code → list of prerequisite codes
PREREQUISITES = {
    'CSC148H1': ['CSC108H1'],
    'CSC263H1': ['CSC148H1', 'MAT137Y1'],  # diamond: two prereqs converge here
    'CSC373H1': ['CSC263H1'],
    'MAT237Y1': ['MAT137Y1'],
}


class Command(BaseCommand):
    help = 'Seeds the database with sample UofT courses and prerequisite relationships.'

    def handle(self, *args, **options):
        self.stdout.write('Clearing existing courses...')
        Course.objects.all().delete()

        self.stdout.write('Creating courses...')
        for data in COURSES:
            Course.objects.create(**data)
            self.stdout.write(f'  Created {data["code"]} — {data["name"]}')

        self.stdout.write('Wiring prerequisites...')
        for code, prereq_codes in PREREQUISITES.items():
            course = Course.objects.get(code=code)
            for prereq_code in prereq_codes:
                prereq = Course.objects.get(code=prereq_code)
                course.prerequisites.add(prereq)
                self.stdout.write(f'  {code} requires {prereq_code}')

        self.stdout.write(self.style.SUCCESS('\nDone! Database seeded successfully.'))
        self.stdout.write('Try searching for CSC373H1 to see the full diamond tree.')
