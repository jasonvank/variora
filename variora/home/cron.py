import os
import random
from threading import Thread

import kronos
import requests
from django.conf import settings
from django.contrib.sitemaps import ping_google
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.db.models import Count
from django.template.loader import render_to_string
from pdfrw import PdfReader, PdfWriter
from wand.color import Color
from wand.image import Image

from file_viewer.models import Document, DocumentThumbnail
from home.api.views_notifications import NotificationEncoder
from home.models import User
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

class UpdateTopDocumentsThread(Thread):
    def run(self):
        DocumentThumbnail.objects.all().delete()

        num_thumbnails = min(8, Document.objects.all().count())

        for document in Document.objects.all().order_by("-num_visit")[0:num_thumbnails]:
            thumbnail = DocumentThumbnail(document=document, description='most_views')
            if DocumentThumbnail.objects.filter(document=document).exists():
                thumbnail.thumbnail_image = DocumentThumbnail.objects.filter(document=document)[0].thumbnail_image
            else:
                thumbnail.thumbnail_image.save('temp_name.jpg', _generate_thumbnail_image_content_file(document))
            thumbnail.save()

        for document in Document.objects.annotate(annotation_count=Count('annotation__id')).order_by("-annotation_count")[0:num_thumbnails]:
            thumbnail = DocumentThumbnail(document=document, description='most_annotations')
            if DocumentThumbnail.objects.filter(document=document).exists():
                thumbnail.thumbnail_image = DocumentThumbnail.objects.filter(document=document)[0].thumbnail_image
            else:
                thumbnail.thumbnail_image.save('temp_name.jpg', _generate_thumbnail_image_content_file(document))
            thumbnail.save()

        for document in Document.objects.annotate(collectors_count=Count('collectors')).order_by("-collectors_count")[0:num_thumbnails]:
            thumbnail = DocumentThumbnail(document=document, description='most_collectors')
            if DocumentThumbnail.objects.filter(document=document).exists():
                thumbnail.thumbnail_image = DocumentThumbnail.objects.filter(document=document)[0].thumbnail_image
            else:
                thumbnail.thumbnail_image.save('temp_name.jpg', _generate_thumbnail_image_content_file(document))
            thumbnail.save()



def _get_unread_notification_list(user):
    max_num_to_fetch = 100

    unread_notifications = user.notifications \
        .prefetch_related('actor') \
        .prefetch_related('target') \
        .prefetch_related('action_object') \
        .unread()[0 : max_num_to_fetch]

    context = {
        'notification_list': [NotificationEncoder().default(notif) for notif in unread_notifications],
        'domain': 'https://variora.ml'
    }
    return context

def _send_email_notification():
    threshold = 1
    receivers = User.objects.annotate(notif_count=Count('notifications__id')).filter(notif_count__gte=threshold)
    for user in receivers:
        context = _get_unread_notification_list(user)
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


@kronos.register('2 0 * * *')
def ping_google_kronjob():
    ping_google()

@kronos.register('0 6 * * *')
def send_email_notification_kronjob():
    NotificationEmailThread().start()
