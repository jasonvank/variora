from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.generic import View

from home.models import User

from ..models import Coterie, CoterieDocument, CoterieInvitation, CoterieApplication


class CoterieEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Coterie):
            return {
                'name': obj.name,
                'description': obj.description,
                'pk': obj.pk,
                'coteriedocument_set': list(obj.coteriedocument_set.all()),
                'administrators': list(obj.administrators.all()),
                'members': list(obj.members.all()),
                'applications': list(obj.application_set.all()),
                'remove_member_method': 'post',
                'remove_member_url': '/coterie/api/coteries/' + str(obj.pk) + '/remove-member',
            }
        elif isinstance(obj, CoterieDocument):
            return CoterieDocumentEncoder().default(obj)
        elif isinstance(obj, User):
            return {
                'nickname': obj.nickname,
                'email_address': obj.email_address,
                'portrait_url': obj.portrait_url,
                'date_joined': obj.date_joined,
                'is_authenticated': obj.is_authenticated,
            }
        elif isinstance(obj, CoterieApplication):
            return CoterieApplicationEncoder().default(obj)
        else:
            return super(CoterieEncoder, self).default(obj)


class CoterieDocumentEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieDocument):
            return {
                'pk': obj.pk,
                'title': obj.title,
                'num_visit': str(obj.num_visit),
                'url': obj.url,
                'download_method': 'get',
                'download_url': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/download',
                'delete_method': 'post',
                'delete_url': '/coterie/api/coteriedocuments/' + str(obj.pk) + '/delete',
                'file_on_server': obj.file_on_server
            }
        return super(CoterieDocumentEncoder, self).default(obj)


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
                'accept_method': 'post',
                'reject_method': 'post',
                'accept_url': '/coterie/api/applications/' + str(obj.pk) + '/accept',
                'reject_url': '/coterie/api/application/' + str(obj.pk) + '/reject',
            }
        return super(CoterieApplicationEncoder, self).default(obj)









