from django.db import models

class Exercise(models.Model):
    MUSCLE_GROUP = [
        ('fullbody', 'Full Body Exercise'),
        ('chest', 'Chest Exercise'),
        ('back', 'Back Exercise'),
        ('legs', 'Leg Exercise'),
        ('shoulders', 'Deltoids Exercise'),
        ('arms', 'Arm Exercise'),  
        ('core', 'Core Exercise'), 
    ]
    
    DIFFICULTY_LEVEL = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advance', 'Advance'),
    ]
    
    EQUIPMENT_REQUIRED = [
        ('none', 'No Equppment Needed'),
        ('dumbells', 'Dumbells'),
        ('pull_up', 'Pull Up Bar'),
        ('others', 'Others'),
    ]
    name = models.CharField(max_length=40, unique=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    image = models.ImageField(upload_to='exercise_thumbnails/', blank=True, null=True)
    calories_burned = models.FloatField(help_text="Estimated calories burned per minute",null=True,blank=True)
    
    muscle_group= models.CharField(
        max_length=20,
        default='fullbody',
        choices= MUSCLE_GROUP
        
    )
    
    difficulty= models.CharField(
        max_length=20,
        default='intermediate',
        choices= DIFFICULTY_LEVEL
        
    )
    
    equipment= models.CharField(
        max_length=20,
        default='none',
        choices= EQUIPMENT_REQUIRED
        
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name