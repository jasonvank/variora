from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.conf import settings
from django.utils.decorators import method_decorator

from home.api.encoders import UserEncoder
from home.models import User
from variora import utils

from ..models import *


class CoterieEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Coterie):
            return {
                'name': obj.name,
                'description': obj.description,
                'pk': obj.pk,
                'uuid': obj.clean_uuid,
                'coteriedocument_set': list(obj.coteriedocument_set.all()),
                'coteriereadlist_set': list(obj.coteriereadlist_set.all()),
                'creator': obj.creator,
                'administrators': list(obj.administrators.all()),
                'members': list(obj.members.all()),
                'remove_member_method': 'post',
                'remove_member_url': '/coterie/api/coteries/' + str(obj.pk) + '/removemember',
            }
        elif isinstance(obj, CoterieDocument):
            return CoterieDocumentEncoder().default(obj)
        elif isinstance(obj, CoterieReadlist):
            return CoterieReadlistEncoder().default(obj)
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        elif isinstance(obj, CoterieApplication):
            return CoterieApplicationEncoder().default(obj)
        else:
            return super(CoterieEncoder, self).default(obj)


class SearchResultCoterieEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Coterie):
            return {
                'pk': obj.pk,
                'uuid': obj.clean_uuid,
                'name': obj.name,
                'description': obj.description,
                'administrators': list(obj.administrators.all()),
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)


class CoterieDocumentEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieDocument):
            if obj.uploader is None:
                if obj.owner.creator is not None:
                    obj.uploader = obj.owner.creator
                    obj.save()
                elif obj.owner.administrators.all().exists():
                    obj.uploader = obj.owner.administrators.all().first()
                    obj.save()

            return {
                'pk': obj.pk,
                'uuid': obj.uuid,
                'slug': utils.uuid2slug(obj.uuid),
                'title': obj.title,
                'num_visit': str(obj.num_visit),
                'url': obj.url,
                'download_method': 'get',
                'download_url': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/download',
                'delete_method': 'post',
                'delete_url': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/delete',
                'file_on_server': obj.file_on_server,
                'renameUrl': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/rename',
                'upload_time': obj.upload_time,
                'uploader_name': obj.uploader.nickname if obj.uploader is not None else 'Unknown',
                'uploader_portrait_url': obj.uploader.portrait_url if obj.uploader is not None else settings.ANONYMOUS_USER_PORTRAIT_URL,
                'subscribe_url': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/subscribe',
                'unsubscribe_url': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/unsubscribe',
            }
        return super(CoterieDocumentEncoder, self).default(obj)


class CoterieAnnotationReplyEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieAnnotationReply):
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
                'num_like': obj.num_like,
                # 'content': conditional_escape(obj.content),
                'content': obj.content,
                'reply_to_annotation_reply_uuid': reply_to_annotation_reply_uuid
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        return super(CoterieAnnotationReplyEncoder, self).default(obj)


class CoterieAnnotationEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieAnnotation):
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
        elif isinstance(obj, CoterieAnnotationReply):
            return CoterieAnnotationReplyEncoder().default(obj)
        else:
            return super(CoterieAnnotationEncoder, self).default(obj)


class CoterieInvitationEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieInvitation):
            return {
                'pk': obj.pk,
                'invitation_message': obj.invitation_message,
                'coterie_pk': obj.coterie.pk,
                'coterie_name': obj.coterie.name,
                'inviter_email': obj.inviter.email_address,
                'inviter_nickname': obj.inviter.nickname,
                'invitee_email': obj.invitee.email_address,
                'invitee_nickname': obj.invitee.nickname,
                'accept_method': 'post',
                'reject_method': 'post',
                'accept_url': '/coterie/api/invitations/' + str(obj.pk) + '/accept',
                'reject_url': '/coterie/api/invitations/' + str(obj.pk) + '/reject',
            }
        return super(CoterieInvitationEncoder, self).default(obj)


class CoterieApplicationEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieApplication):
            return {
                'pk': obj.pk,
                'application_message': obj.application_message,
                'coterie_pk': obj.coterie.pk,
                'coterie_name': obj.coterie.name,
                'applicant_email': obj.applicant.email_address,
                'applicant_nickname': obj.applicant.nickname,
                'applicant': obj.applicant,
                'accept_method': 'post',
                'reject_method': 'post',
                'accept_url': '/coterie/api/applications/' + str(obj.pk) + '/accept',
                'reject_url': '/coterie/api/applications/' + str(obj.pk) + '/reject',
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        return super(CoterieApplicationEncoder, self).default(obj)


class CoterieReadlistListEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieReadlist):
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
            return super(CoterieReadlistListEncoder, self).default(obj)


class CoterieReadlistEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieReadlist):
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
                'delete_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/delete',
                'collect_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/collect',
                'uncollect_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/uncollect',
                'remove_document_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/remove_document',
                'rename_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/rename',
                'change_desc_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/change_desc',
                'change_privacy_url': '/coterie/api/' + str(obj.coterie.id) + '/coteriereadlists/' + obj.slug + '/change_privacy',
            }
        elif isinstance(obj, CoterieDocument):
            return CoterieDocumentEncoder().default(obj)
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        else:
            return super(CoterieReadlistEncoder, self).default(obj)
