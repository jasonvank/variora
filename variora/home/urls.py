from django.conf.urls import include, url

from . import views

urlpatterns = [  # obsolete UI pages
    url(r'^obsolete_home$', views.display_obsolete_home_page),

    url(r'^sign_up', views.display_sign_up_page),

    url(r'^handle_sign_up', views.handle_sign_up, name="handle_sign_up"),

] + [  # new UI with react and restful APIs
    url(r'^api/', include('home.api.urls')),

    url(r'^jason_test', views.jason_test),

    url(r'^sign-in$', views.display_sign_in_page),

    # index using react router
    url(r'^$', views.display_index),
    url(r'^collected', views.display_index),
    url(r'^groups', views.display_index),
    url(r'^search', views.display_index),
]
