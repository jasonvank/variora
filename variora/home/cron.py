import os
import random
from datetime import datetime, timedelta
from threading import Thread

import kronos
import requests
from django.conf import settings
from django.contrib.sitemaps import ping_google
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.db.models import Count, IntegerField, OuterRef, Subquery
from django.template.loader import render_to_string
from django.utils import timezone
from notifications.models import Notification
from pdfrw import PdfReader, PdfWriter
from wand.color import Color
from wand.image import Image

from coterie.models import (InvitationCode,
                            NonRegisteredUserTempCoterieInvitation)
from file_viewer.models import Document, DocumentThumbnail
from home.api.views_notifications import NotificationEncoder
from home.models import User, UserSetting
from variora.utils import send_email_from_noreply


def _generate_thumbnail_image_content_file(document):
    content = None

    if document.file_on_server:
        content = document.unique_file.file_field.read()
    else:
        with requests.request('get', document.external_url, stream=True) as response:
            content = response.content

    temp_pdf_path = os.path.join(settings.MEDIA_ROOT, 'document_thumbnails', 'temp.pdf')
    with open(temp_pdf_path, 'w+') as f:
        f.write(content)

    reader = PdfReader(temp_pdf_path)

    if len(reader.pages) > 1:
        page = reader.pages[0]
        writer = PdfWriter()
        writer.addpage(page)
        writer.write(temp_pdf_path)

    images = Image(filename=temp_pdf_path, resolution=38)
    images.background_color = Color('white')
    images.alpha_channel = 'flatten'
    os.remove(temp_pdf_path)
    return ContentFile(images.make_blob('jpg'))


def _generate_thumbnail_obj(document, description=''):
    thumbnail = DocumentThumbnail(document=document, description=description)
    if DocumentThumbnail.objects.filter(document=document).exists():
        thumbnail.thumbnail_image = DocumentThumbnail.objects.filter(document=document)[0].thumbnail_image
    else:
        thumbnail.thumbnail_image.save('temp_name.jpg', _generate_thumbnail_image_content_file(document))
    thumbnail.save()
    return thumbnail


class UpdateTopDocumentsThread(Thread):
    def run(self):
        DocumentThumbnail.objects.all().delete()

        num_thumbnails = min(8, Document.objects.all().count())

        for document in Document.objects.all().order_by("-num_visit")[0:num_thumbnails]:
            _generate_thumbnail_obj(document, description='most_views')

        for document in Document.objects.annotate(annotation_count=Count('annotation__id')).order_by("-annotation_count")[0:num_thumbnails]:
            _generate_thumbnail_obj(document, description='most_annotations')

        for document in Document.objects.annotate(collectors_count=Count('collectors')).order_by("-collectors_count")[0:num_thumbnails]:
            _generate_thumbnail_obj(document, description='most_collectors')


def _get_yesterday_unread_notification_list(user):
    max_num_to_fetch = 100

    yesterday = timezone.now() - timedelta(1)
    unread_notifications = user.notifications.filter(timestamp__gte=yesterday) \
        .prefetch_related('actor') \
        .prefetch_related('target') \
        .prefetch_related('action_object') \
        .unread()[0 : max_num_to_fetch]

    context = {
        'notification_list': [NotificationEncoder().default(notif) for notif in unread_notifications],
        'domain': 'https://www.variora.io'
    }
    return context


def _send_email_notification():
    threshold = 1

    users_without_setting = User.objects.filter(setting=None)
    for user in users_without_setting:
        UserSetting.objects.create(user=user)
    users_with_setting = User.objects.exclude(setting=None)
    subscribed_users = users_with_setting.filter(setting__email_subscribe=True)

    # get unread notification from yesterday
    yesterday = timezone.now() - timedelta(1)
    unreads = Notification.objects.filter(unread=True).filter(timestamp__gte=yesterday)
    this_user_unreads_count = unreads.filter(recipient=OuterRef('pk')).annotate(c=Count('*')).values('c')[:1]

    receivers = subscribed_users \
        .annotate(notif_count=Subquery(this_user_unreads_count, output_field=IntegerField())) \
        .filter(notif_count__gte=threshold)
        # .filter(email_address__iendswith='@ijc.sg') \

    for user in receivers:
        context = _get_yesterday_unread_notification_list(user)
        html_message = render_to_string('home/email_templates/email.html', context)
        send_email_from_noreply(
            subject='Variora: Unread notifications',
            receiver_list=[user.email_address],
            content=html_message,
        )


class NotificationEmailThread(Thread):
    def run(self):
        _send_email_notification()


@kronos.register('6 0 * * *')
def update_top_documents_kronjob():
    UpdateTopDocumentsThread().start()


@kronos.register('0 0 * * *')
def clear_expired_sessions_kronjob():
    call_command('clearsessions', interactive=True)


@kronos.register('0 0 * * 1')
def clear_expired_temp_invitation_kronjob():
    NonRegisteredUserTempCoterieInvitation.objects.all().delete()


@kronos.register('1 0 * * 1')  # every Monday
def clear_invitation_code_kronjob():
    InvitationCode.objects.all().delete()


@kronos.register('2 0 * * *')
def ping_google_kronjob():
    ping_google()


@kronos.register('0 6 * * *')
def send_email_notification_kronjob():
    NotificationEmailThread().start()


# @kronos.register('0 0 5 31 2 *')  # Feb 31 will never happen, so this cron job will never be executed unless manually
# def test_send_email():
#     send_email_from_noreply(
#         subject='Variora: test email',
#         receiver_list=['yuyang.royl8@gmail.com'],
#         content='This is a test email',
#     )
