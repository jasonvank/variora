import os
import random

import kronos
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.db.models import Count
from pdfrw import PdfReader, PdfWriter
from wand.image import Image

from file_viewer.models import Document, DocumentThumbnail


@kronos.register('0 0 * * *')
def complain():
    DocumentThumbnail.objects.all().delete()

    num_thumbnails = min(1, Document.objects.all().count())

    # for document in Document.objects.all().order_by("-num_visit")[0:num_thumbnails]:
    for document in Document.objects.annotate(annotation_count=Count('annotation__id')).order_by("-annotation_count")[0:num_thumbnails]:
        content = None

        if document.file_on_server:
            content = document.unique_file.file_field.read()
        else:
            with requests.request('get', document.external_url, stream=True) as response:
                content = response.content

        temp_pdf_path = os.path.join(settings.MEDIA_ROOT, 'temp.pdf')

        with open(temp_pdf_path, 'w+') as f:
            f.write(content)
        reader = PdfReader(temp_pdf_path)

        if len(reader.pages) > 1:
            page = reader.pages[0]
            writer = PdfWriter()
            writer.addpage(page)
            writer.write(temp_pdf_path)

        images = Image(filename=temp_pdf_path, resolution=66)
        thumbnail = DocumentThumbnail(document=document)
        thumbnail.thumbnail_image.save('dumpy.jpg', ContentFile(images.make_blob('jpeg')))
        thumbnail.save()

    os.remove(temp_pdf_path)
