from __future__ import unicode_literals

import uuid

from django.db import models
from django.dispatch import receiver

from home.models import User
from variora import utils
from variora.utils import ModelWithCleanUUID

from .managers import DocumentManager, DocumentThumbnailManager


def upload_to(instance, filename):
    name_without_extension, extension = filename.split(".")
    # if a user uploads file name.jpeg
    # the file will be store at media/jpeg/name.jpeg
    return '{0}/{1}'.format(extension, filename)

class UniqueFile(models.Model):
    file_field = models.FileField(upload_to=upload_to)
    md5 = models.CharField(max_length=32)

    @property
    def size(self):  # in MB
        return self.file_field.size / 1024.0 / 1024

    def __unicode__(self):
        return self.file_field.name


# before the Model.delete() and QuerySet.delete() are called, this method will execute first
@receiver(models.signals.pre_delete, sender=UniqueFile)
# "sender" and "**kwargs" are required though they are of no use here, do not delete them
def delete_local_file(sender, instance, **kwargs):
    # get the location of the file to be deleted.
    # eg: pdf/test.pdf
    file_location = instance.file_field.name

    # instance.file_field.storage will return an instance of Storage' subclass,
    # which handle the file store and delete and other operations
    # use its delete method to delete the local file
    # associated with the corresponding file_field of the model to be deleted
    instance.file_field.storage.delete(file_location)


class Document(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=1028, db_index=True)
    owner = models.ForeignKey(User)  # many Documents to one User
    collectors = models.ManyToManyField(User, related_name="collected_document_set", blank=True)
    unique_file = models.ForeignKey(UniqueFile, blank=True, null=True)  # many Documents to one UniqueFile
    num_visit = models.IntegerField(default=0, db_index=True)
    external_url = models.CharField(max_length=2083, blank=True, db_index=True)
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
    def slug(self):
        return utils.uuid2slug(self.uuid)

    @property
    def file_on_server(self):
        return self.unique_file != None

    def __unicode__(self):
        return self.title

@receiver(models.signals.post_delete, sender=Document)
def may_delete_unique_file(sender, instance, **kwargs):
    if instance.file_on_server:
        # if a UniqueFile is not referenced by any Document or CoterieDocument, delete this UniqueFile
        unique_file = instance.unique_file
        if len(unique_file.document_set.all()) + len(unique_file.coteriedocument_set.all()) == 0:
            unique_file.delete()


def thumbnail_upload_to(instance, filename):
    return '{0}/{1}-{2}.jpg'.format('document_thumbnails', instance.document.id, instance.document.title)

class DocumentThumbnail(models.Model):
    document = models.ForeignKey(Document)
    thumbnail_image = models.ImageField(upload_to=thumbnail_upload_to)
    description = models.CharField(max_length=128, db_index=True)
    create_time = models.DateTimeField(auto_now=False, auto_now_add=True)

    objects = DocumentThumbnailManager()

@receiver(models.signals.pre_delete, sender=DocumentThumbnail)
def delete_document_thumbnail(sender, instance, **kwargs):
    if instance.thumbnail_image:
        instance.thumbnail_image.storage.delete(instance.thumbnail_image.name)


class Readlist(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=1028, db_index=True)
    create_time = models.DateTimeField(auto_now=False, auto_now_add=True)
    creator = models.ForeignKey(User, related_name="created_readlist_set")
    collectors = models.ManyToManyField(User, related_name="collected_readlist_set", blank=True)
    documents = models.ManyToManyField(Document, related_name="belonged_readlist_set", blank=True)


class Comment(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    post_time = models.DateTimeField(auto_now=False, auto_now_add=True)
    commenter = models.ForeignKey(User)  # many Comments to one User
    document_this_comment_belongs = models.ForeignKey(Document)  # many Comments to one Document
    content = models.TextField()
    reply_to_comment = models.ForeignKey("Comment",
                                         related_name="reply_set",
                                         null=True, blank=True)
    num_like = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)

    def __unicode__(self):
        return str(self.id) + ": " + self.content


class Annotation(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    post_time = models.DateTimeField(auto_now=False, auto_now_add=True)
    edit_time = models.DateTimeField(null=True, blank=True)
    annotator = models.ForeignKey(User)
    document_this_annotation_belongs = models.ForeignKey(Document)
    content = models.TextField()
    is_public = models.BooleanField(default=True)

    page_index = models.IntegerField()
    height_percent = models.FloatField()
    width_percent = models.FloatField()
    top_percent = models.FloatField()
    left_percent = models.FloatField()
    frame_color = models.CharField(max_length=32)

    num_like = models.IntegerField(default=0)

    def __unicode__(self):
        return str(self.id) + ": " + self.content

    @property
    def url(self):
        document = self.document_this_annotation_belongs
        return '/documents/' + document.slug + '/' + document.title.replace(' ', '-') + \
               '?annotation=' + self.clean_uuid


class AnnotationReply(ModelWithCleanUUID):
    uuid = models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False)
    post_time = models.DateTimeField(auto_now=False, auto_now_add=True)
    edit_time = models.DateTimeField(null=True, blank=True)
    replier = models.ForeignKey(User)  # many Comments to one User
    reply_to_annotation = models.ForeignKey(Annotation)
    reply_to_annotation_reply = models.ForeignKey("AnnotationReply",
                                                  related_name="reply_set",
                                                  null=True, blank=True)
    content = models.TextField()
    num_like = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)

    def __unicode__(self):
        return str(self.id) + ": " + self.content
