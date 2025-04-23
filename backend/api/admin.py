# api/admin.py (or your app's admin.py)
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib import admin
from django.utils.html import format_html
from .models import *
from django import forms


# Register your CustomUser with a custom admin interface
admin.site.register(CustomUser, UserAdmin)

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

