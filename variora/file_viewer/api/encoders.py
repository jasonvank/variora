from django.contrib.auth.models import AnonymousUser
from django.core.serializers.json import DjangoJSONEncoder

from home.api.encoders import UserEncoder
from home.models import User
from django.utils.html import conditional_escape
from ..models import (Annotation, AnnotationReply, Document, DocumentThumbnail,
                      Readlist)


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
                'uploader_name': obj.owner.nickname,
                'uploader_portrait_url': obj.owner.portrait_url,
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


class AnnotationReplyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, AnnotationReply):
            if obj.is_public:
                replier = obj.replier
            else:
                replier = {
                    'is_authenticated': False,
                },

            reply_to_annotation_reply_uuid = None
            if obj.reply_to_annotation_reply is not None:
                reply_to_annotation_reply_uuid = obj.reply_to_annotation_reply.uuid

            return {
                'pk': obj.pk,
                'uuid': obj.uuid,
                'post_time': obj.post_time,
                'edit_time': obj.edit_time,
                'replier': replier,
                # 'content': conditional_escape(obj.content),
                'content': obj.content,
                'reply_to_annotation_reply_uuid': reply_to_annotation_reply_uuid
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        return super(AnnotationReplyEncoder, self).default(obj)


class AnnotationEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Annotation):
            if obj.is_public:
                annotator = obj.annotator
            else:
                annotator = {
                    'is_authenticated': False,
                },
            return {
                'pk': obj.pk,
                'uuid': obj.uuid,
                'annotator': annotator,
                'page_index': obj.page_index,
                'height_percent': obj.height_percent,
                'width_percent': obj.width_percent,
                'top_percent': obj.top_percent,
                'left_percent': obj.left_percent,
                'frame_color': obj.frame_color,
                'num_like': obj.num_like,
                'post_time': obj.post_time,
                'edit_time': obj.edit_time,
                'replies': list(obj.annotationreply_set.all().order_by('post_time')),
                # 'content': conditional_escape(obj.content),
                'content': obj.content,
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        elif isinstance(obj, AnnotationReply):
            return AnnotationReplyEncoder().default(obj)
        else:
            return super(AnnotationEncoder, self).default(obj)


class ReadlistListEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Readlist):
            return {
                'id': obj.id,
                'uuid': obj.clean_uuid,
                'slug': obj.slug,
                'name': obj.name,
                'owner': obj.creator,
                'url': '/readlists/' + obj.slug,
                'documents_uuids': list(map(lambda document: document.clean_uuid, list(obj.documents.all()))),
                'num_collectors': obj.collectors.count(),
                'create_time': obj.create_time,
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        else:
            return super(ReadlistListEncoder, self).default(obj)


class ReadlistEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Readlist):
            return {
                'uuid': obj.clean_uuid,
                'slug': obj.slug,
                'name': obj.name,
                'documents': list(obj.documents.all()),
                'owner': obj.creator,
                'description': obj.description,
                'num_collectors': obj.collectors.count(),
                'create_time': obj.create_time,

                'url': '/readlists/' + obj.slug,
                'delete_url': '/file_viewer/api/readlists/' + obj.slug + '/delete',
                'collect_url': '/file_viewer/api/readlists/' + obj.slug + '/collect',
                'uncollect_url': '/file_viewer/api/readlists/' + obj.slug + '/uncollect',
                'remove_document_url': '/file_viewer/api/readlists/' + obj.slug + '/remove_document',
                'rename_url': '/file_viewer/api/readlists/' + obj.slug + '/rename',
                'change_desc_url': '/file_viewer/api/readlists/' + obj.slug + '/change_desc',
                'change_privacy_url': '/file_viewer/api/readlists/' + obj.slug + '/change_privacy',
            }
        elif isinstance(obj, Document):
            return DocumentEncoder().default(obj)
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        else:
            return super(ReadlistEncoder, self).default(obj)
