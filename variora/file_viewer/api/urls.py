from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^documents/(?P<pk>\d+)$', views.DocumentView.as_view(), name="document_restfu_api"),

    url(r'^documents/(?P<pk>\d+)/(?P<operation>\w+)', views.DocumentView.as_view(), name="document_restfu_api"),
]







