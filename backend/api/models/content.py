from django.db import models



class EducationalContent(models.Model):
    CONTENT_TYPE_CHOICES = [
        ('video', 'Video'),
        ('blog', 'Blog'),
    ]
    CATEGORY_CHOICES = [
        ('workouts', 'Workouts'),
        ('nutrition', 'Nutrition'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPE_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='workouts')
    upload_date = models.DateTimeField(auto_now_add=True)

    thumbnail = models.ImageField(upload_to='content_thumbnails/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    blog_content = models.TextField(blank=True, null=True)

    views = models.IntegerField(default=0)
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return f"{self.get_content_type_display()}: {self.title}"

    class Meta:
        ordering = ['-upload_date']
        verbose_name_plural = "Educational Content"
        

