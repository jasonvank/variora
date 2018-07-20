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


# @login_required(login_url='/')
def create_invitation(request):
    POST = request.POST
    if 'coterie_id' not in POST or 'invitee_emails' not in POST or 'invitation_message' not in POST:
        return HttpResponse(status=403)
    try:
        successful_invitations = []
        unregistered_emails = []
        for invitee_email in POST['invitee_emails'].split(','):
            invitee_email = invitee_email.strip()
            if validate_email(invitee_email):
                try:
                    invitee = User.objects.get(email_address=invitee_email)
                    invitation = CoterieInvitation()
                    invitation.inviter = get_user(request)
                    invitation.coterie = Coterie.objects.get(pk=POST['coterie_id'])
                    invitation.invitee = invitee
                    invitation.invitation_message = POST['invitation_message']
                    if invitation.inviter not in invitation.coterie.administrators.all():
                        return HttpResponse(status=403)
                    invitation.save()
                    successful_invitations.append(invitation)
                except ObjectDoesNotExist:
                    unregistered_emails.append(invitee_email)
        return JsonResponse({
            'successful_invitations': successful_invitations,
            'unregistered_emails': unregistered_emails,
        }, encoder=CoterieInvitationEncoder, safe=False)
    except ObjectDoesNotExist:
            return HttpResponse(status=404)


class InvitationsView(View):
    def get(self, request, **kwargs):
        GET = request.GET
        user = get_user(request)
        if isinstance(user, AnonymousUser):
            return JsonResponse([], encoder=CoterieInvitationEncoder, safe=False)
        try:
            invitations = CoterieInvitation.objects.filter(acceptance__isnull=True) \
                .select_related('inviter').select_related('invitee').select_related('coterie')
            if 'to' not in GET and 'from' not in GET:
                invitations = invitations.filter(acceptance__isnull=True, invitee=user)
            else:
                # TODO: add user right validation. not everyone can view whichever invitation list
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
