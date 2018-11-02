import urllib
from hashlib import md5

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.views.generic import View

from file_viewer.models import UniqueFile
from variora import utils

from .. import models
from ..models import *
from .encoders import *


def _delete_coteriedocument(document, user):
    if user in document.owner.administrators.all() or user.pk == document.uploader.pk:
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


def _rename_coteriedocument(document, user, new_title):
    if user in document.owner.administrators.all() or user.pk == document.uploader.pk:
        document.title = new_title
        document.save()
        return JsonResponse(document, encoder=CoterieDocumentEncoder, safe=False)
    else:
        return HttpResponse(status=403)  # user has no permission


def _subscribe_coteriedocument(document, user):
    coterie = document.owner
    if not (user in coterie.administrators.all() or user in coterie.members.all()):
        return HttpResponseForbidden()
    document.subscribers.add(user)
    return HttpResponse(status=200)


def _unsubscribe_coteriedocument(document, user):
    coterie = document.owner
    if not (user in coterie.administrators.all() or user in coterie.members.all()):
        return HttpResponseForbidden()
    document.subscribers.remove(user)
    return HttpResponse(status=200)


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
            user = request.user
            if operation == 'delete':
                return _delete_coteriedocument(coteriedocument, user)
            if operation == 'subscribe':
                return _subscribe_coteriedocument(coteriedocument, user)
            if operation == 'unsubscribe':
                return _unsubscribe_coteriedocument(coteriedocument, user)
            if operation == 'rename':
                if 'new_title' not in request.POST:
                    return HttpResponse(status=403)
                return _rename_coteriedocument(coteriedocument, user, request.POST['new_title'])
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


def _handle_dropbox_link(link):
    if link.endswith('dl=0'):
        link = link.replace('dl=0', 'raw=1')
    return link


def post_upload_coteriedocument(request):
    TITLE_FORM_KEY = 'title'
    MAX_DOCUMENT_UPLOAD_SIZE = settings.MAX_DOCUMENT_UPLOAD_SIZE

    user = request.user
    if not user.is_authenticated:
        return HttpResponse(status=403)
    if TITLE_FORM_KEY not in request.POST or not utils.check_valid_document_title(request.POST[TITLE_FORM_KEY]):
        return HttpResponse(status=403)

    try:
        coterie = Coterie.objects.get(pk=request.POST["coterie_pk"])

        # if request.user in coterie.administrators.all():

        if 'external_url' in request.POST and request.POST['external_url'] != '':
            external_url = request.POST['external_url']
            if external_url.startswith('https://www.dropbox.com'):
                external_url = _handle_dropbox_link(external_url)
            document = CoterieDocument(
                uploader=user,
                owner=coterie,
                external_url=external_url,
                title=request.POST[TITLE_FORM_KEY]
            )
            document.save()
            document.subscribers.add(user)
        else:
            file_upload = request.FILES["file_upload"]  # this is an UploadedFile object

            if file_upload.size > MAX_DOCUMENT_UPLOAD_SIZE:
                return HttpResponse(status=403)

            this_file_md5 = md5(file_upload.read()).hexdigest()

            try:
                unique_file = UniqueFile.objects.get(md5=this_file_md5)
            except ObjectDoesNotExist:
                unique_file = UniqueFile(file_field=file_upload, md5=this_file_md5)
                unique_file.save()

            document = CoterieDocument(
                uploader=user,
                owner=coterie,
                unique_file=unique_file,
                title=request.POST[TITLE_FORM_KEY]
            )
            document.save()
            document.subscribers.add(user)

        return JsonResponse(document, encoder=CoterieDocumentEncoder, safe=False)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)


def get_coteriedocument_by_slug(request, **kwargs):
    try:
        document = CoterieDocument.objects.get(uuid=utils.slug2uuid(kwargs['slug']))
        return JsonResponse(document, encoder=CoterieDocumentEncoder, safe=False)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)


def get_coteriedocument_annotations_by_slug(request, **kwargs):
    try:
        document = CoterieDocument.objects.get(uuid=utils.slug2uuid(kwargs['slug']))
        return JsonResponse(
            list(document.coterieannotation_set.all()),
            encoder=CoterieAnnotationEncoder,
            safe=False
        )
    except ObjectDoesNotExist:
        return HttpResponse(status=404)










