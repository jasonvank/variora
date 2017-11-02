from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from django.views.generic import View

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
