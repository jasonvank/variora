import threading
import uuid

from django.core.mail import EmailMessage, send_mail
from django.db import models
from validate_email import validate_email
from fcm_django.models import FCMDevice


def uuid2slug(uuid_val):
    try:
        return uuid_val.bytes.encode('base64').rstrip('=\n').replace('/', '_').replace('+', '-')
    except:
        return None


def slug2uuid(slug):
    try:
        return uuid.UUID(bytes=(slug + '==').replace('_', '/').replace('-', '+').decode('base64'))
    except:
        return None


class ModelWithCleanUUID(models.Model):
    class Meta:
        abstract = True

    @property
    def clean_uuid(self):
        return str(self.uuid).replace('-', '')


def send_email_from_noreply(subject, content, receiver_list):
    send_mail(
        subject=subject,
        message=content,
        html_message=content,
        from_email='no-reply@variora.io',
        recipient_list=receiver_list,
        fail_silently=False
    )


def should_return_pwa(request):
    return request.user_agent.is_mobile or request.user_agent.is_tablet


def check_valid_document_title(title):
    if title == '':
        return False
    if ';' in title or ':' in title or '/' in title or '\\' in title or '?' in title or '<' in title or '>' in title:
        return False
    return True

# TODO yy: use this to notify user
def web_push_notify_user(user, title, message):
  devices = FCMDevice.objects.filter(user=user)
  devices.send_message(title=title, body=message, icon="https://www.variora.io/media/logo.png")
