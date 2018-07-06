from django.contrib import admin
from django.contrib.sessions.models import Session
from .admin_notifications import *
from .admin_django_auth import *

import models


class UserModelAdmin(admin.ModelAdmin):
    list_display = ['id', "nickname", "email_address", "level", "is_superuser", "is_staff"]
    list_filter = ["level", "is_superuser", "is_staff"]
    search_fields = ['id', "nickname", "email_address"]
    filter_horizontal = ['groups', 'user_permissions', 'following_users']

class SessionAdmin(admin.ModelAdmin):
    def _session_data(self, obj):
        return obj.get_decoded()
    list_display = ['session_key', '_session_data', 'expire_date']


admin.site.register(Session, SessionAdmin)
admin.site.register(models.User, UserModelAdmin)
