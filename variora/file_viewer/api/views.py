import urllib

from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from django.utils.timezone import now
from django.views.generic import View

from home.models import User
from variora import utils

from ..models import (Annotation, AnnotationReply, Comment, Document,
                      DocumentThumbnail)
from .encoders import (AnnotationEncoder, DocumentEncoder,
                       DocumentThumbnailEncoder)


def _delete_document(document, user):
    if document.owner == user:
        document.delete()
        return HttpResponse(status=200)
    else:
        return HttpResponse(status=403)  # user has no permission

def _uncollect_document(document, user):
    if not user.is_authenticated:
        return HttpResponse(status=403)
    elif user not in document.collectors.all():
        return HttpResponse(status=403)
    document.collectors.remove(user)
    document.save()
    return HttpResponse(status=200)

def _download_document(document):
    if document.file_on_server:
        file_model = document.unique_file
        file_position = file_model.file_field.storage.path(file_model.file_field)
        content = open(file_position, 'rb')
    else:
        content = urllib.urlopen(document.external_url)
    response = HttpResponse(content, content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename=%s.pdf' % document.title
    return response

def _change_readlists(document, user, request):
    for readlist in user.created_readlist_set.all():
        if readlist.clean_uuid in request.POST.getlist('add_readlists[]'):
            readlist.documents.add(document)
        elif readlist.clean_uuid in request.POST.getlist('remove_readlists[]'):
            readlist.documents.remove(document)
    return HttpResponse(status=200)

def _rename_document(document, user, new_title):
    if document.owner == user:
        document.title = new_title
        document.save()
        return JsonResponse(document, encoder=DocumentEncoder, safe=False)
    else:
        return HttpResponse(status=403)  # user has no permission

class DocumentView(View):
    def get(self, request, pk, **kwargs):
        try:
            document = Document.objects.get(id=pk)
            if 'operation' in kwargs:
                operation = kwargs['operation']
                if operation == 'download':
                    return _download_document(document)
                else:
                    return HttpResponse(status=500)  # operation not supported
            else:
                return JsonResponse(document, encoder=DocumentEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    @method_decorator(login_required(login_url='/'))
    def post(self, request, pk, operation):
        try:
            document = Document.objects.get(id=pk)
            user = get_user(request)
            if operation == 'delete':
                return _delete_document(document, user)
            elif operation == 'uncollect':
                return _uncollect_document(document, user)
            elif operation == 'changereadlists':
                return _change_readlists(document, user, request)
            elif operation == 'rename':
                if 'new_title' not in request.POST:
                    return HttpResponse(status=403)
                return _rename_document(document, user, request.POST['new_title'])
        except ObjectDoesNotExist:
            return HttpResponse(status=404)

    @method_decorator(login_required(login_url='/'))
    def delete(self, request, pk):
        try:
            document = Document.objects.get(id=pk)
            user = get_user(request)
            return _delete_document(document, user)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


class DocumentListView(View):
    def get(self, request):
        user = request.user
        uploaded_documents = [] if not user.is_authenticated else list(user.document_set.select_related('unique_file').all())
        collected_documents = [] if not user.is_authenticated else list(user.collected_document_set.select_related('unique_file').all())
        return JsonResponse({
                'uploadedDocuments': uploaded_documents,
                'collectedDocuments': collected_documents
            },
            encoder=DocumentEncoder,
            safe=False
        )


def get_top_document_thumbnails(request):
    return JsonResponse(list(DocumentThumbnail.objects.all_with_related().order_by('create_time')), encoder=DocumentThumbnailEncoder, safe=False)


def get_annotation_content(request, id):
    return HttpResponse(Annotation.objects.get(id=int(id)).content)


def edit_annotation_content(request, id):
    user = get_user(request)
    annotation = Annotation.objects.filter(id=int(id))
    if user.pk != annotation[0].annotator.pk:
        return HttpResponse(status=403)
    annotation.update(content=request.POST['new_content'], edit_time=now())
    return HttpResponse(status=200)


def get_annotation_reply_content(request, id):
    return HttpResponse(AnnotationReply.objects.get(id=int(id)).content)


def edit_annotation_reply_content(request, id):
    user = get_user(request)
    reply = AnnotationReply.objects.filter(id=int(id))
    if user.pk != reply[0].replier.pk:
        return HttpResponse(status=403)
    reply.update(content=request.POST['new_content'], edit_time=now())
    return HttpResponse(status=200)


def get_document_annotations_by_slug(request, **kwargs):
    try:
        document = Document.objects.get(uuid=utils.slug2uuid(kwargs['slug']))
        return JsonResponse(
            list(document.annotation_set.all()),
            encoder=AnnotationEncoder,
            safe=False
        )
    except ObjectDoesNotExist:
        return HttpResponse(status=404)


def get_document_by_slug(request, **kwargs):
    try:
        document = Document.objects.get(uuid=utils.slug2uuid(kwargs['slug']))
        return JsonResponse(document, encoder=DocumentEncoder, safe=False)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
