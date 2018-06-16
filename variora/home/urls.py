from django.conf.urls import include, url
from django.shortcuts import redirect

from . import views

urlpatterns = [
    url(r'^obsolete_home$', views.display_obsolete_home_page),

    url(r'^sign_up', views.display_sign_up_page),

    url(r'^handle_sign_up', views.handle_sign_up, name="handle_sign_up"),

    url(r'^handle_log_in', views.handle_log_in, name="handle_log_in"),

    url(r'^handle_nus_log_in', views.handle_nus_log_in, name="handle_nus_log_in"),

    url(r'^handle_search', views.handle_search),

] + [
    url(r'^api/', include('home.api.urls')),

    url(r'^jason_test', views.jason_test),

    url(r'^sign-in$', views.display_sign_in_page),

    # MUST BE THE LAST ONE
    url(r'^', views.display_index),

]
