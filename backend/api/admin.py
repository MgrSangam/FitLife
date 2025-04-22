# api/admin.py (or your app's admin.py)
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib import admin
from django.utils.html import format_html
from .models import *


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


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('participant', 'progress_date', 'progress_day')
    search_fields = ('participant__user__username', 'participant__challenge__title')