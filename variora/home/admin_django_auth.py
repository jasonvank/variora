from django.contrib import admin
from django.contrib.auth.models import Permission


class PermissionAdmin(admin.ModelAdmin):
    list_display = ['codename', 'name']
    list_filter = []


admin.site.register(Permission, PermissionAdmin)
