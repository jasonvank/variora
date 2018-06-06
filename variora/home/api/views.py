from coterie.models import Coterie, CoterieDocument
from django.contrib.auth import get_user, login, authenticate, logout
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from file_viewer.models import Document
from file_viewer.api.views import DocumentEncoder
from coterie.api.views import CoterieEncoder, CoterieDocumentEncoder

from ..models import User
from django.contrib.auth.models import AnonymousUser


class UserEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, AnonymousUser):
            return {
                'is_authenticated': obj.is_authenticated,
            }
        if isinstance(obj, User):
            return {
                'nickname': obj.nickname,
                'email_address': obj.email_address,
                'portrait_url': obj.portrait_url,
                'date_joined': obj.date_joined,
                'is_authenticated': obj.is_authenticated,
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
            elif isinstance(obj, Coterie):
                return CoterieEncoder().default(obj)
            elif isinstance(obj, CoterieDocument):
                return CoterieDocumentEncoder().default(obj)
            else:
                return super(CombinedEncoder, self).default(obj)

    key = request.GET['key']
    result_documents = list(Document.objects.filter(title__icontains=key))  # case-insensitive contain
    result_users = list(User.objects.filter(Q(nickname__icontains=key) | Q(email_address__icontains=key)))
    result_coteries = list(Coterie.objects.filter(Q(name__icontains=key) | Q(id__icontains=key)))
    return JsonResponse(
        {
            'resultDocuments': result_documents,
            'resultUsers': result_users,
            'resultCoteries': result_coteries
        },
        encoder=CombinedEncoder,
        safe=False
    )


def get_current_user(request):
    return JsonResponse(get_user(request), encoder=UserEncoder, safe=False)


def sign_in(request):
    input_email_address = request.POST['email_address']
    input_password = request.POST['password']
    user = authenticate(email_address=input_email_address, password=input_password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return HttpResponse(status=200)
        else:
            return HttpResponse("account not active", status=400)
    else:
        return HttpResponse("email or password incorrect", status=400)


def sign_off(request):
    logout(request)
    return HttpResponse()







