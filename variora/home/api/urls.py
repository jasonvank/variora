from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'user$', views.get_current_user),

    url(r'users/(?P<pk>\d+)', views.UserAPIView.as_view()),

    url(r'search', views.search_api_view),

    url(r'signin$', views.sign_in),

    url(r'signin/google$', views.google_sign_in),

    url(r'signin/nus', views.nus_sign_in),

    url(r'signoff', views.sign_off),
]
