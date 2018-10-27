from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
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
                'administrators': list(obj.administrators.all()),
                'members': list(obj.members.all()),
                'remove_member_method': 'post',
                'remove_member_url': '/coterie/api/coteries/' + str(obj.pk) + '/removemember',
            }
        elif isinstance(obj, CoterieDocument):
            return CoterieDocumentEncoder().default(obj)
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
                'name': obj.name,
                'description': obj.description,
                'administrators': list(obj.administrators.all()),
            }
        elif isinstance(obj, User):
            return UserEncoder().default(obj)


class CoterieDocumentEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieDocument):
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
                'uploader_name': obj.uploader.nickname if obj.uploader is not None else obj.owner.creator.nickname,
                'uploader_portrait_url': obj.uploader.portrait_url if obj.uploader is not None else obj.owner.creator.portrait_url,
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
                'replies': list(obj.annotationreply_set.all()),
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
