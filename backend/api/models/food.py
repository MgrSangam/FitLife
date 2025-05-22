from django.db import models

class Food(models.Model):
    FOOD_TYPE_CHOICES = [
    ('fruit', 'Fruit'),
    ('vegetable', 'Vegetable'),
    ('grain', 'Grain / Cereal'),
    ('protein', 'Protein (Meat, Fish, Eggs)'),
    ('dairy', 'Dairy'),
    ('fat', 'Fats & Oils'),
    ('snack', 'Snacks'),
    ('beverage', 'Beverages'),
    ('other', 'Other'),
]

    name = models.CharField(max_length=40, unique=True)
    image = models.ImageField(upload_to='exercise_thumbnails/', blank=True, null=True)
    description = models.TextField(max_length=500, null= True, blank= True)
    carbs = models.FloatField(help_text="Grams of carbs per 100g ",null=True,blank=True)
    protein = models.FloatField(help_text="Grams of carbs per 100g")
    fat = models.FloatField(help_text="Grams of carbs per 100g")
    
    food_type = models.CharField(
    max_length=20,
    choices=FOOD_TYPE_CHOICES,
    default='other',
    help_text="Category of the food"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    
    @property
    def calories(self):
        carbs = self.carbs or 0
        protein = self.protein or 0
        fat = self.fat or 0
        return (carbs * 4) + (protein * 4) + (fat * 9)
    
    def __str__(self):
        return self.name
    