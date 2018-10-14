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


class EmailThread(threading.Thread):
    def __init__(self, subject, content, receiver_list):
        self.subject = subject
        self.content = content
        self.receiver_list = receiver_list
        super(EmailThread, self).__init__()

    def run(self):
        send_mail(
            subject=self.subject,
            message=self.content,
            html_message=self.content,
            from_email='variora.noreply@gmail.com',
            recipient_list=self.receiver_list,
            fail_silently=False
        )
