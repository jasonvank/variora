from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect
from notifications.models import Notification
from notifications.utils import id2slug, slug2id

from ..models import User


class NotificationEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Notification):
            slug = str(id2slug(obj.id))
            data = obj.data
            actor_str = str(obj.actor)

            if 'is_public' in data and not data['is_public']:
                actor_str = 'Anonymous'
                data['image_url'] = settings.ANONYMOUS_USER_PORTRAIT_URL

            return {
                'slug': slug,
                'actor': actor_str,
                'verb': obj.verb,
                'description': obj.description or '',
                'action_object': str(obj.action_object),
                'target': str(obj.target),
                'timestamp': obj.timestamp,
                'data': data,
                'unread': obj.unread,
                'mark_read_url': '/notifications/api/notifications/' + slug + '/mark-read',
            }
        return super(NotificationEncoder, self).default(obj)


def get_combined_notification_list(request):
    user = request.user
    try:
        user_is_authenticated = user.is_authenticated()
    except TypeError:  # Django >= 1.11
        user_is_authenticated = user.is_authenticated

    if not user_is_authenticated:
        return JsonResponse([], safe=False)

    try:
        num_to_fetch = request.GET.get('max', 20)  # If they don't specify, make it 5.
        num_to_fetch = int(num_to_fetch)
        num_to_fetch = max(1, num_to_fetch)  # if num_to_fetch is negative, force at least one fetched notifications
        num_to_fetch = min(num_to_fetch, 100)  # put a sane ceiling on the number retrievable
    except ValueError:
        num_to_fetch = 20  # If casting to an int fails, just make it 5.

    unread_notifications = user.notifications \
        .prefetch_related('actor') \
        .prefetch_related('target') \
        .prefetch_related('action_object') \
        .unread()[0 : num_to_fetch]
    unread_count = unread_notifications.count()

    read_notifications = user.notifications \
        .prefetch_related('actor') \
        .prefetch_related('target') \
        .prefetch_related('action_object') \
        .read()[0 : num_to_fetch - unread_count]

    return JsonResponse(list(unread_notifications) + list(read_notifications), encoder=NotificationEncoder, safe=False)


def mark_notification_as_read(request, slug):
    notification_id = slug2id(slug)

    notification = Notification.objects.get(recipient=request.user, id=notification_id)
    notification.mark_as_read()

    return HttpResponse(status=200)


def _safe_cast(s):
    try:
        return long(s)
    except:
        return None


def mark_all_as_read(request):
    if 'notif_slugs_to_mark_as_read' not in request.POST:
        return HttpResponse(status=403)
    slugs_string = request.POST['notif_slugs_to_mark_as_read']
    splitted = slugs_string.split(',')
    trimmed = list(map(lambda ele: ele.strip(), splitted))
    casted = list(map(_safe_cast, trimmed))
    filtered = list(filter(lambda ele: ele is not None, casted))
    ids = list(map(lambda ele: slug2id(ele), filtered))
    for notification_id in ids:
        notification = Notification.objects.get(recipient=request.user, id=notification_id)
        notification.mark_as_read()
    return HttpResponse(status=200)
