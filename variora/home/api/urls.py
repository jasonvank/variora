from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'user$', views.get_current_user),
    url(r'user/setting$', views.get_current_user_setting),

    url(r'users/(?P<pk>\d+)', views.UserAPIView.as_view()),

    url(r'unsubscribe-email', views.email_unsubscribe),
    url(r'subscribe-email', views.email_subscribe),

    url(r'search', views.search_api_view),

    url(r'signin$', views.sign_in),

    url(r'signin/google$', views.google_sign_in),

    url(r'signin/facebook$', views.facebook_sign_in),

    url(r'signin/microsoft$', views.microsoft_sign_in),

    url(r'signin/nus', views.nus_sign_in),

    url(r'signoff', views.sign_off),
]
