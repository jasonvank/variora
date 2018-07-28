from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder

from home.models import User

from ..models import Annotation, AnnotationReply, Comment, Document, DocumentThumbnail, Readlist


class DocumentEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Document):
            return {
                'pk': obj.pk,
                'uuid': obj.uuid,
                'slug': obj.slug,
                'title': obj.title,
                'num_visit': str(obj.num_visit),
                'url': obj.url,
                'download_method': 'get',
                'download_url': '/file_viewer/api/documents/' + str(obj.pk) + '/download',
                'delete_method': 'post',
                'delete_url': '/file_viewer/api/documents/' + str(obj.pk) + '/delete',
                'file_on_server': obj.file_on_server,
                'renameUrl': '/file_viewer/api/documents/' + str(obj.pk) + '/rename',
                'uncollectUrl': '/file_viewer/api/documents/' + str(obj.pk) + '/uncollect',
                'upload_time': obj.upload_time,
            }
        return super(DocumentEncoder, self).default(obj)


class DocumentThumbnailEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, DocumentThumbnail):
            return {
                'title': obj.document.title,
                'image': obj.thumbnail_image.url,
                'open_url': '/documents/' + obj.document.slug + '/' + obj.document.title,
                'description': obj.description,
                'upload_time': obj.document.upload_time,
                'owner_name': obj.document.owner.nickname,
                'owner_email': obj.document.owner.email_address
            }
        return super(DocumentThumbnailEncoder, self).default(obj)


class ReadlistEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Readlist):
            return {
                'name': obj.name,
                'documents': list(obj.documents.all()),
            }
        elif isinstance(obj, Document):
            return DocumentEncoder().default(obj)
        else:
            return super(ReadlistEncoder, self).default(obj)
