from django.core.exceptions import ObjectDoesNotExist
from django.db.models import prefetch_related_objects
from django.http import HttpResponse, JsonResponse
from django.views.generic import View

from ..models import Document, Readlist
from .encoders import (ReadlistEncoder, ReadlistListEncoder)
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
    readlist.name = new_name
    readlist.save()
    return HttpResponse(status=200)


def _change_desc_of_readlist(readlist, request):
    new_desc = request.POST['new_desc']
    readlist.description = new_desc
    readlist.save()
    return HttpResponse(status=200)


def _change_privacy_of_readlist(readlist, request):
    is_public = bool(request.POST['is_public'])
    readlist.is_public = is_public
    readlist.save()
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

        readlists = Readlist.objects.filter(uuid=utils.slug2uuid(slug))
        if not readlists.exists():
            return HttpResponse(status=404)

        readlist = readlists.first()
        if readlist.is_public or readlist.creator.pk == user.pk:
            return JsonResponse(readlist, encoder=ReadlistEncoder, safe=False)
        else:
            return HttpResponse(status=404)

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
        if not user.is_authenticated:
            return JsonResponse({
                'created_readlists': [],
                'collected_readlists': []
            }, encoder=ReadlistListEncoder, safe=False)

        created_readlist = user.created_readlist_set.select_related('creator').all()
        collected_readlist = user.collected_readlist_set.select_related('creator').filter(is_public=True)

        list_of_created_readlist = list(created_readlist)
        list_of_collected_readlist = list(collected_readlist)
        prefetch_related_objects(list_of_created_readlist + list_of_collected_readlist, 'documents')

        return JsonResponse({
            'created_readlists': list_of_created_readlist,
            'collected_readlists': list_of_collected_readlist
        }, encoder=ReadlistListEncoder, safe=False)


def create_readlist(request):
    user = request.user
    if not user.is_authenticated or 'readlist_name' not in request.POST or 'description' not in request.POST:
        return HttpResponse(status=403)
    readlist = Readlist(name=request.POST['readlist_name'], description=request.POST['description'], creator=user)
    readlist.save()
    return JsonResponse(readlist, encoder=ReadlistListEncoder, safe=False)
