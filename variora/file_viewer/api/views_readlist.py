import urllib

from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import prefetch_related_objects
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.views.generic import View

from home.models import User

from ..models import Document, DocumentThumbnail, Readlist
from .encoders import (DocumentEncoder, DocumentThumbnailEncoder,
                       ReadlistEncoder, ReadlistListEncoder)
from variora import utils


def _delete_readlist(readlist):
    readlist.delete()
    return HttpResponse(status=200)

def _collect_readlist(readlist, user):
    if readlist.creator.pk != user.pk:
        readlist.collectors.add(user)
    return HttpResponse(status=200)

def _uncollect_readlist(readlist, user):
    readlist.collectors.remove(user)
    return HttpResponse(status=200)

def _rename_readlist(readlist, request):
    new_name = request.POST['new_name']
    readlist.update(name=new_name)
    return HttpResponse(status=200)

def _change_desc_of_readlist(readlist, request):
    new_desc = request.POST['new_desc']
    readlist.update(description=new_desc)
    return HttpResponse(status=200)

def _change_privacy_of_readlist(readlist, request):
    is_public = bool(request.POST['is_public'])
    readlist.update(is_public=is_public)
    return HttpResponse(status=200)

def _remove_document_from_readlist(readlist, user, request):
    documents = Document.objects.filter(uuid=request.POST['document_uuid'])
    if documents.exists():
        readlist.documents.remove(documents.first())
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=404)

class ReadlistView(View):
    def get(self, request, slug, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return HttpResponse(status=403)
        readlists = Readlist.objects.filter(uuid=utils.slug2uuid(slug))
        if not readlists.exists():
            return HttpResponse(status=404)
        readlist = readlists.first()
        if not readlist.is_public and readlist.creator.pk != user.pk:
            return HttpResponse(status=404)
        return JsonResponse(readlist, encoder=ReadlistEncoder, safe=False)

    @method_decorator(login_required(login_url='/'))
    def post(self, request, slug, operation):
        try:
            user = request.user
            if not user.is_authenticated:
                return HttpResponse(status=403)

            readlists = Readlist.objects.filter(uuid=utils.slug2uuid(slug))
            if not readlists.exists():
                return HttpResponse(status=404)
            readlist = readlists.first()

            if operation == 'collect':
                return _collect_readlist(readlist, user)
            elif operation == 'uncollect':
                return _uncollect_readlist(readlist, user)

            if user.pk != readlist.creator.pk:
                return HttpResponse(status=403)

            if operation == 'delete':
                return _delete_readlist(readlist)
            elif operation == 'rename':
                return _rename_readlist(readlist, request)
            elif operation == 'change_desc':
                return _change_desc_of_readlist(readlist, request)
            elif operation == 'change_privacy':
                return _change_privacy_of_readlist(readlist, request)
            elif operation == 'remove_document':
                return _remove_document_from_readlist(readlist, user, request)
            else:
                return HttpResponse(status=404)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


class ReadlistListView(View):
    def get(self, request):
        user = request.user
        created_readlist = list(user.created_readlist_set.select_related('creator').all()) if user.is_authenticated else []
        collected_readlist = list(user.collected_readlist_set.select_related('creator').filter(is_public=True)) if user.is_authenticated else []
        prefetch_related_objects(created_readlist + collected_readlist, 'documents')
        return JsonResponse({
            'created_readlists': created_readlist,
            'collected_readlists': collected_readlist
        }, encoder=ReadlistListEncoder, safe=False)


def create_readlist(request):
    user = request.user
    if not user.is_authenticated or 'readlist_name' not in request.POST or 'description' not in request.POST:
        return HttpResponse(status=403)
    readlist = Readlist(name=request.POST['readlist_name'], description=request.POST['description'], creator=user)
    readlist.save()
    return JsonResponse(readlist, encoder=ReadlistListEncoder, safe=False)
