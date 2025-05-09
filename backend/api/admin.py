# api/admin.py (or your app's admin.py)
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib import admin
from django.utils.html import format_html
from .models import *
from django import forms


# Register your CustomUser with a custom admin interface
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'username', 'first_name', 'last_name', 'is_instructor', 'contact', 'specialization']
    search_fields = ['email', 'username']
    ordering = ['email']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Instructor info', {'fields': ('is_instructor', 'contact', 'experience', 'bio', 'specialization')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'username', 'password1', 'password2',
                'first_name', 'last_name',
                'is_instructor', 'contact', 'experience', 'bio', 'specialization',
            ),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')

admin.site.register(CustomUser, CustomUserAdmin)





@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display   = ('title','difficulty','muscle_group','workout_type','thumb','start_date','end_date')
    list_filter    = ('difficulty','muscle_group','workout_type')
    search_fields  = ('title','description')

    readonly_fields = ('preview',)
    fieldsets = (
        (None, {
            'fields': (
                'title','description','duration',
                ('start_date','end_date'),
                'difficulty','muscle_group','workout_type',
                'image','preview'
            )
        }),
    )

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:150px;"/>', obj.image.url)
        return "(no image)"
    preview.short_description = "Current image"

    def thumb(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;"/>', obj.image.url)
        return ""
    thumb.short_description = "Img"
    
@admin.register(ChallengeParticipant)
class ChallengeParticipantAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'date_joined')
    search_fields = ('user__username', 'challenge__title')



    
    

class EducationalContentForm(forms.ModelForm):
    class Meta:
        model = EducationalContent
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Show/hide fields based on content type
        if self.instance and self.instance.content_type:
            if self.instance.content_type == 'video':
                self.fields['blog_content'].widget = forms.HiddenInput()
            elif self.instance.content_type == 'blog':
                self.fields['video_url'].widget = forms.HiddenInput()
                self.fields['duration'].widget = forms.HiddenInput()

@admin.register(EducationalContent)
class EducationalContentAdmin(admin.ModelAdmin):
    list_display = ('title', 'content_type', 'category', 'upload_date', 'preview_thumbnail')
    list_filter = ('content_type', 'category')
    search_fields = ('title', 'description')
    date_hierarchy = 'upload_date'

    fieldsets = (
        (None, {
            'fields': ('title', 'description', 'content_type', 'category', 'thumbnail')
        }),
        ('Video Content', {
            'fields': ('video_url',),
            'classes': ('video-content',)
        }),
        ('Blog Content', {
            'fields': ('blog_content',),
            'classes': ('blog-content',)
        }),
    )

    
    class Media:
        js = ('admin/js/content_type_toggle.js',)  # You'll need to create this
    
    def preview_thumbnail(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="height:50px;"/>', obj.thumbnail.url)
        return ""
    preview_thumbnail.short_description = "Thumbnail"
    
    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj:
            if obj.content_type == 'video':
                # Hide blog fields
                fieldsets[2][1]['classes'] += ('hidden',)
            elif obj.content_type == 'blog':
                # Hide video fields
                fieldsets[1][1]['classes'] += ('hidden',)
        return fieldsets
    

@admin.register(Goal)
class GoalsAdmin(admin.ModelAdmin):
    list_display = ['user', 'goal_type', 'target_weight', 'start_date', 'target_date']
    search_fields = ['user__email', 'goal_type']



@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'muscle_group', 'difficulty', 'equipment', 'created_at')
    list_filter = ('muscle_group', 'difficulty', 'equipment', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'image')
        }),
        ('Exercise Details', {
            'fields': ('calories_burned', 'muscle_group', 'difficulty', 'equipment')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ('name', 'carbs', 'protein', 'fat', 'calories_per_100g')
    list_filter = ('food_type',)

    def calories_per_100g(self, obj):
        return round(obj.calories, 2)
    calories_per_100g.short_description = 'Calories (per 100g)'
    
    def food_type_display(self, obj):
        return dict(Food.FOOD_TYPE_CHOICES).get(obj.food_type)
    food_type_display.short_description = 'Food Type'





from django.contrib import admin
from .models import SubscriptionPlan

@admin.register(SubscriptionPlan)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'is_active', 'start_date', 'end_date', 'trainer', 'nutritionist')
    list_filter = ('plan', 'is_active')
    search_fields = ('user__email', 'trainer__email', 'nutritionist__email')
    readonly_fields = ('start_date', 'end_date', 'trainer', 'nutritionist')

    def save_model(self, request, obj, form, change):
        # Custom logic to handle saving the subscription, if needed
        super().save_model(request, obj, form, change)


from django.contrib import admin
from django.utils.html import format_html
from .models import FitnessPlan, FitnessPlanExercise

class FitnessPlanExerciseInline(admin.TabularInline):
    model = FitnessPlanExercise
    extra = 1
    fields = ['exercise', 'day', 'sets', 'reps', 'duration_minutes', 'order']
    ordering = ['day', 'order']

@admin.register(FitnessPlan)
class FitnessPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'difficulty', 'duration_weeks', 'created_at','picture_preview']
    list_filter = ['plan_type', 'difficulty', 'created_at']
    search_fields = ['name', 'description']
    inlines = [FitnessPlanExerciseInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'plan_type', 'difficulty', 'duration_weeks', 'picture', 'picture_preview')  # added picture_preview
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at', 'picture_preview']  # added picture_preview here

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related()
    
    def picture_preview(self, obj):
        if obj.picture:
            return format_html('<img src="{}" width="200" style="object-fit: cover;"/>', obj.picture.url)
        return "(No picture)"
    picture_preview.short_description = "Picture Preview"

@admin.register(FitnessPlanExercise)
class FitnessPlanExerciseAdmin(admin.ModelAdmin):
    list_display = ['fitness_plan', 'exercise', 'day', 'sets', 'reps', 'order']
    list_filter = ['day', 'fitness_plan']
    search_fields = ['exercise__name', 'fitness_plan__name']
    list_select_related = ['fitness_plan', 'exercise']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('fitness_plan', 'exercise')

    

from django.contrib import admin
from .models import MealPlan, MealFood

class MealFoodInline(admin.TabularInline):
    model = MealFood
    extra = 1
    fields = ['food', 'meal_time', 'quantity_grams', 'day', 'order']
    readonly_fields = ['total_calories', 'total_carbs', 'total_protein', 'total_fat']
    ordering = ['day', 'meal_time', 'order']

@admin.register(MealPlan)
class MealPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'daily_calorie_target', 'duration_weeks', 'image_preview']
    list_filter = ['plan_type', 'created_at']
    search_fields = ['name', 'description']
    inlines = [MealFoodInline]
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'plan_type', 'daily_calorie_target', 'duration_weeks', 'image')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />'.format(obj.image.url))
        return "No Image"
    image_preview.short_description = 'Preview'

@admin.register(MealFood)
class MealFoodAdmin(admin.ModelAdmin):
    list_display = ['meal_plan', 'food', 'meal_time', 'day', 'quantity_grams', 'total_calories']
    list_filter = ['meal_time', 'day', 'meal_plan']
    search_fields = ['food__name', 'meal_plan__name']
    list_select_related = ['meal_plan', 'food']
    
    readonly_fields = ['total_calories', 'total_carbs', 'total_protein', 'total_fat']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('meal_plan', 'food')
    
    
    
from django.contrib import admin
from .models import FitnessPlanUser

@admin.register(FitnessPlanUser)
class FitnessPlanUserAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'fitness_plan_name', 'joined_at')
    list_filter = ('joined_at', 'fitness_plan', 'user')
    search_fields = ('user__email', 'user__username', 'fitness_plan__name')
    date_hierarchy = 'joined_at'
    ordering = ('-joined_at',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def fitness_plan_name(self, obj):
        return obj.fitness_plan.name
    fitness_plan_name.short_description = 'Fitness Plan'
    

from django.contrib import admin
from .models import MealPlanUser

@admin.register(MealPlanUser)
class MealPlanUserAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'meal_plan_name', 'joined_at')
    list_filter = ('joined_at', 'meal_plan', 'user')
    search_fields = ('user__email', 'user__username', 'meal_plan__name')
    date_hierarchy = 'joined_at'
    ordering = ('-joined_at',)

    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'User Email'

    def meal_plan_name(self, obj):
        return obj.meal_plan.name
    meal_plan_name.short_description = 'Meal Plan'