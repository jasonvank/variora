from django.core.exceptions import ObjectDoesNotExist
from django.http import (HttpResponse, HttpResponseForbidden,
                         HttpResponseNotFound, JsonResponse)
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.generic import View
from notifications.signals import notify
from validate_email import validate_email

from home.models import User
from variora.utils import web_push_notify_user

from ..models import Coterie, CoterieApplication, CoterieDocument
from .encoders import (CoterieApplicationEncoder, CoterieDocumentEncoder,
                       CoterieEncoder)


# @login_required(login_url='/')
def create_application(request):
    POST = request.POST
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden()
    if 'coterie_id' not in POST or 'application_message' not in POST:
        return HttpResponseForbidden()

    try:
        application = CoterieApplication()

        application.applicant = user
        application.coterie = Coterie.objects.get(pk=POST['coterie_id'])
        application.application_message = POST['application_message']

        application.save()

        for admin in application.coterie.administrators.all():
            notify.send(
                sender=application.applicant, recipient=admin,
                action_object=application, verb='apply join group',
                redirect_url='/groups/' + application.coterie.clean_uuid + '/members',
                image_url=application.applicant.portrait_url,
                description=application.application_message,
            )
            # web_push_notify_user(admin, title='new application', message='Your group has a new applicant')
        return JsonResponse(application, encoder=CoterieApplicationEncoder, safe=False)
    except ObjectDoesNotExist:
        return HttpResponseNotFound()


class ApplicationsView(View):
    def get(self, request, **kwargs):
        GET = request.GET
        user = request.user
        if not user.is_authenticated:
            return JsonResponse([], encoder=CoterieApplicationEncoder, safe=False)

        try:
            applications = CoterieApplication.objects.filter(acceptance__isnull=True)
            if 'from' not in GET and 'for' not in GET:
                applications = applications.filter(acceptance__isnull=True, applicant=user)
            else:
                if 'from' in GET:
                    applicant = User.objects.get(email_address=GET['from'])
                    if applicant.pk != user.pk:
                        return HttpResponseForbidden()
                    applications = applications.filter(applicant=applicant)
                if 'for' in GET:
                    coterie = Coterie.objects.get(pk=GET['for'])
                    if user not in coterie.administrators.all():
                        return HttpResponseForbidden()
                    applications = applications.filter(coterie=coterie)
            return JsonResponse(list(applications), encoder=CoterieApplicationEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


class ApplicationView(View):
    def get(self, request, pk, **kwargs):
        try:
            application = CoterieApplication.objects.get(pk=pk)
            return JsonResponse(application, encoder=CoterieApplicationEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    def post(self, request, pk, operation):
        try:
            user = request.user
            application = CoterieApplication.objects.get(pk=pk)
            coterie = application.coterie
            applicant = application.applicant
            if user not in coterie.administrators.all():
                return HttpResponse(status=403)

            if operation == 'accept':
                coterie.members.add(applicant)
                application.acceptance = True
            elif operation == 'reject':
                application.acceptance = False
            application.response_datetime = timezone.now()
            application.save()
            return HttpResponse(status=200)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)
