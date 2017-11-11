import urllib

from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator
from django.views.generic import View

from ..models import Coterie
from home.models import User


class CoterieEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, Coterie):
            return {
                'name': obj.name,
                'description': obj.description,
                'pk': obj.pk,
            }
        return super(CoterieEncoder, self).default(obj)


class CoterieListView(View):
    def get(self, request):
        user = get_user(request)
        administrated_coteries = list(user.administrated_coterie_set.all())
        joined_coteries = list(user.joined_coterie_set.all())
        return JsonResponse(
            {
                'administratedCoteries': administrated_coteries, 
                'joinedCoteries': joined_coteries,
            }, 
            encoder=CoterieEncoder, 
            safe=False
        )

@login_required(login_url='/')
def create_coterie(request):
    coterie = Coterie()
    coterie.name = request.POST['coterie_name']
    if 'coterie_description' in request.POST:
        coterie.description = request.POST["coterie_description"]
    coterie.save()
    coterie.administrators.add(get_user(request))
    return JsonResponse(coterie, encoder=CoterieEncoder, safe=False)






