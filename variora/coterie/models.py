from __future__ import unicode_literals

import uuid

from django.db import models
from django.dispatch import receiver

from file_viewer.models import UniqueFile
from file_viewer.managers import DocumentManager
from home.models import User
from variora.utils import ModelWithCleanUUID


class Coterie(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=256, db_index=True)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, related_name='created_coterie_set', null=True)
    administrators = models.ManyToManyField(User, related_name="administrated_coterie_set")
    members = models.ManyToManyField(User, related_name="joined_coterie_set", blank=True)

    def __unicode__(self):
        return self.name


class CoterieInvitation(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    coterie = models.ForeignKey(Coterie)
    inviter = models.ForeignKey(User, related_name='sent_invitation_set')
    invitee = models.ForeignKey(User, related_name='received_invitation_set')
    invitation_message = models.TextField(blank=True)
    send_datetime = models.DateTimeField(auto_now=False, auto_now_add=True)
    acceptance = models.NullBooleanField(null=True, blank=True, db_index=True)
    response_datetime = models.DateTimeField(null=True, blank=True)


class CoterieApplication(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    coterie = models.ForeignKey(Coterie, related_name='application_set')
    applicant = models.ForeignKey(User, related_name='sent_application_set')
    application_message = models.TextField(blank=True)
    send_datetime = models.DateTimeField(auto_now=False, auto_now_add=True)
    acceptance = models.NullBooleanField(null=True, blank=True, db_index=True)
    response_datetime = models.DateTimeField(null=True, blank=True)


class CoterieDocument(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=1028, db_index=True)
    owner = models.ForeignKey(Coterie)
    unique_file = models.ForeignKey(UniqueFile, blank=True, null=True)
    num_visit = models.IntegerField(default=0)
    external_url = models.CharField(max_length=2083, blank=True)
    upload_time = models.DateTimeField(auto_now=False, auto_now_add=True)

    objects = DocumentManager()

    @property
    def url(self):
        if self.external_url != "":
            return "/proxy?origurl=" + self.external_url
        else:
            return self.unique_file.file_field.url

    @property
    def size(self):
        if self.file_on_server:
            return self.unique_file.size
        return 0

    @property
    def file_on_server(self):
        return self.unique_file != None

    def __unicode__(self):
        return self.title


@receiver(models.signals.post_delete, sender=CoterieDocument)
def may_delete_unique_file(sender, instance, **kwargs):
    if instance.file_on_server:
        # if a UniqueFile is not referenced by any Document or CoterieDocument, delete this UniqueFile
        unique_file = instance.unique_file
        if len(unique_file.document_set.all()) + len(unique_file.coteriedocument_set.all()) == 0:
            unique_file.delete()

class CoterieComment(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    post_time = models.DateTimeField(auto_now=False, auto_now_add=True)
    commenter = models.ForeignKey(User)
    document_this_comment_belongs = models.ForeignKey(CoterieDocument)
    content = models.TextField()
    reply_to_comment = models.ForeignKey("CoterieComment",
                                         related_name="reply_set",
                                         null=True, blank=True)
    num_like = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)

    def __unicode__(self):
        return str(self.id) + ": " + self.content


class CoterieAnnotation(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    post_time = models.DateTimeField(auto_now=False, auto_now_add=True)
    edit_time = models.DateTimeField(null=True, blank=True)
    annotator = models.ForeignKey(User)
    document_this_annotation_belongs = models.ForeignKey(CoterieDocument)
    content = models.TextField()
    is_public = models.BooleanField(default=True)

    page_index = models.IntegerField()
    height_percent = models.FloatField()
    width_percent = models.FloatField()
    top_percent = models.FloatField()
    left_percent = models.FloatField()
    frame_color = models.CharField(max_length=18)

    num_like = models.IntegerField(default=0)

    def __unicode__(self):
        return str(self.id) + ": " + self.content


class CoterieAnnotationReply(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    post_time = models.DateTimeField(auto_now=False, auto_now_add=True, db_index=True)
    edit_time = models.DateTimeField(null=True, blank=True)
    replier = models.ForeignKey(User)
    reply_to_annotation = models.ForeignKey(CoterieAnnotation, related_name='annotationreply_set')
    reply_to_annotation_reply = models.ForeignKey("CoterieAnnotationReply",
                                                  related_name="reply_set",
                                                  null=True, blank=True)
    content = models.TextField()
    num_like = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)

    def __unicode__(self):
        return str(self.id) + ": " + self.content
