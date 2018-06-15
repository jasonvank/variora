import urllib

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
from validate_email import validate_email

from home.models import User

from ..models import Coterie, CoterieDocument, CoterieInvitation
from .encoders import CoterieDocumentEncoder, CoterieEncoder, CoterieInvitationEncoder


class CoterieListView(View):
    def get(self, request):
        user = get_user(request)
        administrated_coteries = [] if isinstance(user, AnonymousUser) else list(user.administrated_coterie_set.all())
        joined_coteries = [] if isinstance(user, AnonymousUser) else list(user.joined_coterie_set.all())
        return JsonResponse(
            {
                'administratedCoteries': administrated_coteries,
                'joinedCoteries': joined_coteries,
            },
            encoder=CoterieEncoder,
            safe=False
        )


def _delete_coterie(coterie, user):
    if user in coterie.administrators.all():
        coterie.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)  # user has no permission

class CoterieView(View):
    def get(self, request, pk, **kwargs):
        try:
            coterie = Coterie.objects.get(pk=pk)
            return JsonResponse(coterie, encoder=CoterieEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    def post(self, request, pk, operation):
        try:
            coterie = Coterie.objects.get(pk=pk)
            user = get_user(request)
            if operation == 'delete':
                return _delete_coterie(coterie, user)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


def _delete_coteriedocument(document, user):
    if user in document.owner.administrators.all():
        document.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)  # user has no permission


def _download_coteriedocument(document):
    if document.file_on_server:
        file_model = document.unique_file
        file_position = file_model.file_field.storage.path(file_model.file_field)
        content = open(file_position, 'rb')
    else:
        content = urllib.urlopen(document.external_url)
    response = HttpResponse(content, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=%s.pdf' % document.title
    return response


class CoterieDocumentView(View):
    def get(self, request, pk, **kwargs):
        try:
            coteriedocument = CoterieDocument.objects.get(pk=pk)
            if 'operation' in kwargs:
                operation = kwargs['operation']
                if operation == 'download':
                    return _download_coteriedocument(coteriedocument)
                else:
                    return HttpResponse(status=500)
            else:
                return JsonResponse(coteriedocument, encoder=CoterieDocumentEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    def post(self, request, pk, operation):
        try:
            coteriedocument = CoterieDocument.objects.get(pk=pk)
            user = get_user(request)
            if operation == 'delete':
                return _delete_coteriedocument(coteriedocument, user)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


class InvitationsView(View):
    def get(self, request, **kwargs):
        try:
            GET = request.GET
            invitations = CoterieInvitation.objects.filter(acceptance__isnull=True)
            if 'from' in GET:
                invitations = invitations.filter(inviter=User.objects.get(email_address=GET['from']))
            if 'to' in GET:
                invitations = invitations.filter(invitee=User.objects.get(email_address=GET['to']))
            return JsonResponse(list(invitations), encoder=CoterieInvitationEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


class InvitationView(View):
    def get(self, request, pk, **kwargs):
        try:
            invitation = CoterieInvitation.objects.get(pk=pk)
            return JsonResponse(invitation, encoder=CoterieInvitationEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    def post(self, request, pk, operation):
        try:
            user = get_user(request)
            invitation = CoterieInvitation.objects.get(pk=pk)
            coterie = invitation.coterie
            invitee = invitation.invitee
            if user.pk != invitee.pk:
                return HttpResponse(status=403)
            if operation == 'accept':
                coterie.members.add(invitee)
                invitation.acceptance = True
            elif operation == 'reject':
                invitation.acceptance = False
            invitation.response_datetime = timezone.now()
            invitation.save()
            return HttpResponse(status=200)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


@login_required(login_url='/')
def create_coterie(request):
    coterie = Coterie()
    coterie.name = request.POST['coterie_name']
    if 'coterie_description' in request.POST:
        coterie.description = request.POST["coterie_description"]
    coterie.save()
    coterie.administrators.add(get_user(request))
    return JsonResponse(coterie, encoder=CoterieEncoder, safe=False)


# @login_required(login_url='/')
def create_invitation(request):
    POST = request.POST
    if 'coterie_id' not in POST or 'invitee_emails' not in POST or 'invitation_message' not in POST:
        return HttpResponse(status=403)
    try:
        invitations = []
        for invitee_email in POST['invitee_emails'].split(','):
            invitee_email = invitee_email.strip()
            if validate_email(invitee_email):
                invitation = CoterieInvitation()
                invitation.inviter = get_user(request)
                invitation.coterie = Coterie.objects.get(pk=POST['coterie_id'])
                invitation.invitee = User.objects.get(email_address=invitee_email)
                invitation.invitation_message = POST['invitation_message']
                if invitation.inviter not in invitation.coterie.administrators.all():
                    return HttpResponse(status=403)
                invitation.save()
                invitations.append(invitation)
        return JsonResponse(invitations, encoder=CoterieInvitationEncoder, safe=False)
    except ObjectDoesNotExist:
            return HttpResponse(status=404)
