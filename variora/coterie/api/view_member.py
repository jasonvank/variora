from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse

from ..models import (Coterie, CoterieAnnotation, CoterieAnnotationReply,
                      CoterieDocument, CoterieInvitation)
from .encoders import (CoterieDocumentEncoder, CoterieEncoder,
                       CoterieInvitationEncoder)


def get_uploaded_documents_for_member(request, coterie_pk):
    user = request.user
    try:
        coterie = Coterie.objects.get(pk=coterie_pk)
        uploaded_documents = coterie.coteriedocument_set.filter(uploader=user)
        return JsonResponse(
            list(uploaded_documents),
            encoder=CoterieDocumentEncoder,
            safe=False
        )
    except ObjectDoesNotExist:
        return HttpResponse(status=404)
