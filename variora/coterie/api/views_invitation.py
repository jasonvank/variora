import random
from threading import Thread

from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.generic import View
from validate_email import validate_email

from home.models import User
from variora.utils import send_email_from_noreply

from ..models import (Coterie, CoterieDocument, CoterieInvitation,
                      InvitationCode, NonRegisteredUserTempCoterieInvitation)
from .encoders import (CoterieDocumentEncoder, CoterieEncoder,
                       CoterieInvitationEncoder)


class TempInvitationEmailThread(Thread):
    def __init__(self, unregistered_emails, invitation, random_code):
        Thread.__init__(self)
        self.unregistered_emails = unregistered_emails
        self.invitation = invitation
        self.code = random_code

    def run(self):
        html_message = render_to_string('home/email_templates/new_invitation_but_not_registered.html', {
            'sign_in_url': 'https://www.variora.io/sign-in',
            'group_name': self.invitation.coterie.name,
            'message': self.invitation.invitation_message,
            'inviter': self.invitation.inviter.nickname,
            'invitation_code': self.code,
        })
        send_email_from_noreply(
            subject='Variora: you have a group invitation. Sign up to view',
            receiver_list=self.unregistered_emails,
            content=html_message,
        )


class InvitationEmailThread(Thread):
    def __init__(self, emails, invitation, random_code):
        Thread.__init__(self)
        self.emails = emails
        self.invitation = invitation
        self.code = random_code

    def run(self):
        html_message = render_to_string('home/email_templates/new_invitation.html', {
            'redirect_url': 'https://www.variora.io/',
            'group_name': self.invitation.coterie.name,
            'message': self.invitation.invitation_message,
            'inviter': self.invitation.inviter.nickname,
            'invitation_code': self.code,
        })
        send_email_from_noreply(
            subject='Variora: new group invitation',
            receiver_list=self.emails,
            content=html_message,
        )


def _generate_random_code():
    code = random.randint(0, 999990)
    code = str(code).zfill(5)
    return code


# @login_required(login_url='/')
def create_invitation(request):
    POST = request.POST
    if 'coterie_id' not in POST or 'invitee_emails' not in POST or 'invitation_message' not in POST:
        return HttpResponse(status=403)
    try:
        coterie = Coterie.objects.get(pk=POST['coterie_id'])
        successful_invitations = []
        unregistered_emails = []
        for invitee_email in POST['invitee_emails'].split(','):
            invitee_email = invitee_email.strip()
            if validate_email(invitee_email):
                try:
                    invitee = User.objects.get(email_address=invitee_email)
                    invitation = CoterieInvitation()
                    invitation.inviter = request.user
                    invitation.coterie = coterie
                    invitation.invitee = invitee
                    invitation.invitation_message = POST['invitation_message']
                    if invitation.inviter not in invitation.coterie.administrators.all():
                        return HttpResponse(status=403)
                    invitation.save()
                    successful_invitations.append(invitation)

                    # create invitation code
                    random_code = _generate_random_code()
                    code = InvitationCode(
                        code=random_code,
                        invitation=invitation,
                        coterie=coterie,
                        nonregistered_user_temp_invitation=None,
                    )
                    code.save()

                    # email to registered users
                    InvitationEmailThread([invitee.email_address], invitation, random_code).start()
                except ObjectDoesNotExist:
                    unregistered_emails.append(invitee_email)

        # email to unregistered users
        for email in unregistered_emails:
            temp_invitation = NonRegisteredUserTempCoterieInvitation(
                inviter=request.user,
                invitation_message=POST['invitation_message'],
                coterie=coterie,
                invitee_email=email,
            )
            temp_invitation.save()

            # create invitation code
            random_code = _generate_random_code()
            code = InvitationCode(
                code=random_code,
                invitation=None,
                coterie=coterie,
                nonregistered_user_temp_invitation=temp_invitation,
            )
            code.save()

            TempInvitationEmailThread([email], temp_invitation, random_code).start()

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
        if not user.is_authenticated:
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
                if invitee not in coterie.administrators.all():
                    coterie.members.add(invitee)
                invitation.acceptance = True
            elif operation == 'reject':
                invitation.acceptance = False
            invitation.response_datetime = timezone.now()
            invitation.save()
            return HttpResponse(status=200)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)
