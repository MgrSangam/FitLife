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

    # Specify which fields to display in the form
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),  # Default fields
        ('Personal info', {'fields': ('first_name', 'last_name')}),  # Personal info
        ('Instructor info', {'fields': ('is_instructor', 'contact', 'experience', 'bio', 'specialization')}),  # Instructor info
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),  # Permissions
        ('Important dates', {'fields': ('last_login', 'date_joined')}),  # Important dates
    )

    # Add these fields for adding new users
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'first_name', 'last_name'),
        }),
    )

    filter_horizontal = ('groups', 'user_permissions')

    class Media:
        js = ('admin/js/instructor_toggle.js',)  # Custom JS to toggle visibility of instructor fields

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





