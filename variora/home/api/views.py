import urllib2

import facebook
from django.contrib.auth import authenticate, get_user, login, logout
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views.generic import View
from google.auth.transport import requests
from google.oauth2 import id_token

from coterie.api.encoders import (CoterieDocumentEncoder, CoterieEncoder,
                                  SearchResultCoterieEncoder)
from coterie.models import Coterie, CoterieDocument
from file_viewer.api.views import DocumentEncoder
from file_viewer.models import Document

from ..models import User
from .encoders import UserEncoder


class UserAPIView(View):
    def get(self, request, pk):
        try:
            user = User.objects.get(id=pk)
            return JsonResponse(user, encoder=UserEncoder, safe=False)
        except ObjectDoesNotExist:
            return HttpResponse(status=404)


def search_api_view(request):
    if 'key' not in request.GET or request.GET['key'] == '':
        return HttpResponse(status=403)

    key = request.GET['key']

    class CombinedEncoder(DjangoJSONEncoder):
        def default(self, obj):
            if isinstance(obj, User):
                return UserEncoder().default(obj)
            elif isinstance(obj, Document):
                return DocumentEncoder().default(obj)
            elif isinstance(obj, Coterie):
                return SearchResultCoterieEncoder().default(obj)
            else:
                return super(CombinedEncoder, self).default(obj)

    result_documents = list(Document.objects.filter(title__icontains=key))[:100]  # case-insensitive contain
    result_users = list(User.objects.filter(Q(nickname__icontains=key) | Q(email_address__icontains=key)))[:100]
    result_coteries = list(Coterie.objects.filter(Q(name__icontains=key) | Q(id__icontains=key)))[:100]
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


# https://developers.google.com/identity/sign-in/web/backend-auth
def google_sign_in(request):
    try:
        # TODO: do not hardcode client ID, put it into private_settings.py and import from settings
        userinfo = id_token.verify_oauth2_token(str(request.POST['id_token']), requests.Request(), "887521980338-fj0n0r7ui5cn313f4vh6paqm411upf3o.apps.googleusercontent.com")

        if userinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise Exception('Wrong issuer.')
        if 'error_description' in userinfo:
            raise Exception('Wrong ID token.')
        if 'email_verified' not in userinfo or not userinfo['email_verified']:
            raise Exception('Wrong email.')

        if not User.objects.filter(email_address=userinfo['email']).exists():
            new_user = User()
            new_user.set_nickname(userinfo['name'])
            new_user.set_email_address(userinfo['email'])
            new_user.external_portrait_url = userinfo['picture']
            new_user.save()
        user = User.objects.get(email_address=userinfo['email'])
        user.set_nickname(userinfo['name'])
        user.external_portrait_url = userinfo['picture']
        user.save()
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        return HttpResponse(status=200)
    except Exception:
        return HttpResponse("Google login fail", status=400)


# https://developers.facebook.com/docs/graph-api/reference/user
# https://facebook-sdk.readthedocs.io/en/latest/api.html
def facebook_sign_in(request):
    try:
        import ast
        auth_response = ast.literal_eval(request.POST['auth_response'])
        graph = facebook.GraphAPI(access_token=auth_response['accessToken'], version=2.4)
        user_response = graph.get_object(id=auth_response['userID'], fields='email,picture,name')
        email = user_response['email']
        name = user_response['name']
        portrait_url = user_response['picture']['data']['url']
        if not User.objects.filter(email_address=email).exists():
            new_user = User()
            new_user.set_nickname(name)
            new_user.set_email_address(email)
            new_user.external_portrait_url = portrait_url
            new_user.save()
        user = User.objects.get(email_address=email)
        user.set_nickname(name)
        user.external_portrait_url = portrait_url
        user.save()
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        return HttpResponse(status=200)
    except Exception:
        return HttpResponse("Facebook login fail", status=400)


def nus_sign_in(request):
    token = request.GET['token']
    email = urllib2.urlopen("https://ivle.nus.edu.sg/api/Lapi.svc/UserEmail_Get?APIKey=Z6Q2MnpaPX8sDSOfHTAnN&Token="+token).read()[1:-1]
    if email != "":  # email not empty means NUS login successful
        # if no such user in database, means this is the first time login using NUS id, so create a new user
        if not User.objects.filter(email_address=email).exists():
            nickname = urllib2.urlopen("https://ivle.nus.edu.sg/api/Lapi.svc/UserName_Get?APIKey=Z6Q2MnpaPX8sDSOfHTAnN&Token="+token).read()[1:-1]
            new_user = User()
            new_user.set_nickname(nickname)
            new_user.set_email_address(email)
            new_user.save()
        user = User.objects.get(email_address=email)
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(request, user)
        return redirect("/")
    return HttpResponse("<h1>NUSNET ID incorrect</h1>")
