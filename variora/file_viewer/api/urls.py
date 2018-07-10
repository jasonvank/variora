from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^documents/(?P<pk>\d+)$', views.DocumentView.as_view()),

    url(r'^documents/(?P<pk>\d+)/(?P<operation>\w+)', views.DocumentView.as_view()),

    url(r'^documents$', views.DocumentListView.as_view()),

    url(r'^documents/explore$', views.get_top_document_thumbnails),
]







