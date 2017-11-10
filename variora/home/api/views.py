from coterie.models import Coterie
from django.contrib.auth import get_user
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from file_viewer.models import Document
from file_viewer.api.views import DocumentEncoder

from ..models import User


class UserEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, User):
            return {
                'nickname': obj.nickname,
                'email_address': obj.email_address,
                'portrait_url': obj.portrait_url,
                'date_joined': obj.date_joined 
            }
        return super(UserEncoder, self).default(obj)


class UserAPIView(View):
    def get(self, request, pk):
        try:
            user = User.objects.get(id=pk)
            return JsonResponse(user, encoder=UserEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


def search_api_view(request):
    class CombinedEncoder(DjangoJSONEncoder):
        def default(self, obj):
            if isinstance(obj, User):
                return UserEncoder().default(obj)
            elif isinstance(obj, Document):
                return DocumentEncoder().default(obj)
            else:
                return super(CombinedEncoder, self).default(obj)

    key = request.GET['key']
    result_documents = list(Document.objects.filter(title__icontains=key))  # case-insensitive contain
    result_users = list(User.objects.filter(Q(nickname__icontains=key) | Q(email_address__icontains=key)))
    result_coteries = list(Coterie.objects.filter(Q(name__icontains=key) | Q(id__icontains=key)))
    return JsonResponse(
        {
            'resultDocuments': result_documents, 
            'resultUsers': result_users
        }, 
        encoder=CombinedEncoder, 
        safe=False
    )


def get_current_user(request):
    return JsonResponse(get_user(request), encoder=UserEncoder, safe=False)



