from django.contrib import admin
import models


class UserModelAdmin(admin.ModelAdmin):
    list_display = ["nickname", "email_address", "level", "is_superuser", "is_staff"]
    list_filter = ["level", "is_superuser", "is_staff"]
    search_fields = ["nickname", "email_address"]
    filter_horizontal = ['groups', 'user_permissions', 'following_users']

admin.site.register(models.User, UserModelAdmin)
