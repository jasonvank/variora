from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q, prefetch_related_objects
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseForbidden
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.views.generic import View

from home.models import User

from ..models import (Coterie, CoterieAnnotation, CoterieAnnotationReply,
                      CoterieDocument, CoterieInvitation)
from .encoders import (CoterieDocumentEncoder, CoterieEncoder,
                       CoterieInvitationEncoder)
from .view_application import (ApplicationsView, ApplicationView,
                               create_application)
from .view_documents import *
from .view_invitation import InvitationsView, InvitationView, create_invitation
from .view_member import *


class CoterieListView(View):
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            administrated_coteries = []
            joined_coteries = []
        else:
            administrated_coteries = list(user.administrated_coterie_set.all())
            joined_coteries = list(user.joined_coterie_set.all())
            combined = administrated_coteries + joined_coteries
            prefetch_related_objects(combined, 'administrators')
            prefetch_related_objects(combined, 'members')
            prefetch_related_objects(combined, 'coteriedocument_set__unique_file')
        return JsonResponse({
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


def _exit_coterie(coterie, user):
    if user in coterie.administrators.all():
        return HttpResponse(status=403)
    if user in coterie.members.all():
        coterie.members.remove(user)
    return HttpResponse(status=200)


def _remove_member(request, coterie, user):
    if 'member_email_address' not in request.POST:
        return HttpResponse(status=403)
    try:
        member = User.objects.get(email_address=request.POST['member_email_address'])
    except ObjectDoesNotExist:
        return HttpResponse(status=403)

    if user in coterie.administrators.all() and member in coterie.members.all():
        coterie.members.remove(member)
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)


def _update_coterie(request, coterie, user):
    if user not in coterie.administrators.all():
        return HttpResponse(status=403)

    if 'new_name' in request.POST:
        coterie.name = request.POST['new_name']
    if 'new_desc' in request.POST:
        coterie.description = request.POST['new_desc']
    coterie.save()
    return HttpResponse(status=200)


def _join_coterie_with_invitation_code(request, coterie, user):
    post = request.POST
    if 'invitation_code' not in post or not user.is_authenticated:
        return HttpResponse(status=403)
    try:
        invitation_codes = InvitationCode.objects.filter(code=post['invitation_code'], coterie=coterie)
        print(invitation_codes)
        if not invitation_codes.exists():
            return HttpResponse(status=404)
        invitation_code = invitation_codes.first()

        if invitation_code.invitation is not None:
            invitation_code.invitation.delete()
        if invitation_code.nonregistered_user_temp_invitation is not None:
            invitation_code.nonregistered_user_temp_invitation.delete()
        # I am still considering whether to delete the code since they will be cleared periodically
        invitation_code.delete()

        if user not in coterie.administrators.all():
            coterie.members.add(user)
        return JsonResponse(coterie, encoder=CoterieEncoder, safe=False)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)


class CoterieView(View):
    def get(self, request, pk, **kwargs):
        try:
            coterie = Coterie.objects \
                .prefetch_related('administrators').prefetch_related('members') \
                .prefetch_related('coteriedocument_set__unique_file').get(pk=pk)
            return JsonResponse(coterie, encoder=CoterieEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    def post(self, request, pk, operation):
        try:
            coterie = Coterie.objects.get(pk=pk)
            user = request.user
            if operation == 'delete':
                return _delete_coterie(coterie, user)
            elif operation == 'exit':
                return _exit_coterie(coterie, user)
            elif operation == 'removemember':
                return _remove_member(request, coterie, user)
            elif operation == 'update':
                return _update_coterie(request, coterie, user)
            elif operation == 'join_with_code':
                return _join_coterie_with_invitation_code(request, coterie, user)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


@login_required(login_url='/')
def create_coterie(request):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden()

    coterie = Coterie()
    coterie.name = request.POST['coterie_name']
    coterie.creator = user
    if 'coterie_description' in request.POST:
        coterie.description = request.POST["coterie_description"]
    coterie.save()
    coterie.administrators.add(user)
    return JsonResponse(coterie, encoder=CoterieEncoder, safe=False)


def get_annotation_content(request, id):
    return HttpResponse(CoterieAnnotation.objects.get(id=int(id)).content)


def edit_annotation_content(request, id):
    user = request.user
    if not user.is_authenticated:
        return HttpResponseForbidden()

    annotation = CoterieAnnotation.objects.filter(id=int(id))
    if user.pk != annotation[0].annotator.pk:
        return HttpResponse(status=403)
    annotation.update(content=request.POST['new_content'], edit_time=now())
    return HttpResponse(status=200)


def get_annotation_reply_content(request, id):
    return HttpResponse(CoterieAnnotationReply.objects.get(id=int(id)).content)


def edit_annotation_reply_content(request, id):
    user = get_user(request)
    reply = CoterieAnnotationReply.objects.filter(id=int(id))
    if user.pk != reply[0].replier.pk:
        return HttpResponse(status=403)
    reply.update(content=request.POST['new_content'], edit_time=now())
    return HttpResponse(status=200)


class CombinedEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, CoterieDocument):
            return CoterieDocumentEncoder().default(obj)
        elif isinstance(obj, User):
            return UserEncoder().default(obj)
        # elif isinstance(obj, Readlist):
        #     return ReadlistListEncoder().default(obj)
        # elif isinstance(obj, Coterie):
        #     return SearchResultCoterieEncoder().default(obj)
        else:
            return super(CombinedEncoder, self).default(obj)


def search_api_view(request, coterie_uuid):
    try:
        coterie = Coterie.objects.get(uuid=coterie_uuid)

        if 'key' not in request.GET or request.GET['key'] == '':
            return HttpResponse(status=403)

        key = request.GET['key']

        result_documents = list(CoterieDocument.objects.filter_with_related(title__icontains=key).filter(owner=coterie))[:100]  # case-insensitive contain
        # result_users = list(User.objects.filter(Q(nickname__icontains=key) | Q(email_address__icontains=key)))[:100]
        # result_coteries = list(Coterie.objects.filter(Q(name__icontains=key) | Q(id__icontains=key)))[:100]
        # result_readlists = list(Readlist.objects.filter(Q(name__icontains=key) | Q(description__icontains=key)).filter(is_public=True))[:100]
        return JsonResponse(
            {
                'resultDocuments': result_documents,
                'resultUsers': [],
                # 'resultCoteries': result_coteries,
                'resultReadlists': [],
            },
            encoder=CombinedEncoder,
            safe=False
        )

    except ObjectDoesNotExist:
        return HttpResponse(status=404)
