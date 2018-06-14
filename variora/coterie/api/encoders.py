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

from ..models import Coterie, CoterieDocument, CoterieInvitation


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
                'coterie': obj.coterie.pk,
                'inviter': obj.inviter.pk,
                'inviter': obj.inviter.pk,
                'invitee': obj.invitee.pk,
            }
        return super(CoterieInvitationEncoder, self).default(obj)
