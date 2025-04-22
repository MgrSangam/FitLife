# api/admin.py (or your app's admin.py)
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Register your CustomUser with a custom admin interface
admin.site.register(CustomUser, UserAdmin)