from django.db import models


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)   # e.g. "CSC263H1"
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,   # prereqs are directional: A requires B ≠ B requires A
        blank=True,
        related_name='unlocks',
    )

    class Meta:
        ordering = ['code']

    def __str__(self):
        return self.code
