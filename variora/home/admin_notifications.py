from django.contrib import admin
from notifications.models import Notification

admin.site.unregister(Notification)


class NotificationAdmin(admin.ModelAdmin):
    raw_id_fields = ('recipient', )
    list_display = ('recipient', 'actor', 'verb', 'description', 'action_object',
                    'level', 'target', 'unread', 'public')
    list_filter = ('level', 'unread', 'public', 'timestamp', )


admin.site.register(Notification, NotificationAdmin)
