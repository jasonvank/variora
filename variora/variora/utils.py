import threading
import uuid

from django.core.mail import EmailMessage, send_mail
from django.db import models
from validate_email import validate_email


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
        from_email='variora.noreply@gmail.com',
        recipient_list=receiver_list,
        fail_silently=False
    )
