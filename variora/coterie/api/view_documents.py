from hashlib import md5

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse

from file_viewer.models import UniqueFile

from .. import models
from ..models import Coterie, CoterieApplication, CoterieDocument
from .encoders import CoterieDocumentEncoder


def _handle_dropbox_link(link):
    if link.endswith('dl=0'):
        link = link.replace('dl=0', 'raw=1')
    return link

def post_upload_coteriedocument(request):
    user = request.user
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
                title=request.POST["title"]
            )
            document.save()
        else:
            file_upload = request.FILES["file_upload"]  # this is an UploadedFile object

            if file_upload.size > settings.MAX_DOCUMENT_UPLOAD_SIZE:
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
                title=request.POST["title"]
            )
            document.save()  # save this document to the database

        return JsonResponse(document, encoder=CoterieDocumentEncoder, safe=False)
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
