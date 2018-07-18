from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^documents/(?P<pk>\d+)$', views.DocumentView.as_view()),

    url(r'^documents/(?P<pk>\d+)/(?P<operation>\w+)', views.DocumentView.as_view()),

    url(r'^documents$', views.DocumentListView.as_view()),

    url(r'^documents/explore$', views.get_top_document_thumbnails),

    url(r'^annotations/(?P<id>\d+)/content$', views.get_annotation_content),
    url(r'^annotationreplies/(?P<id>\d+)/content$', views.get_annotation_reply_content),

    url(r'^annotations/(?P<id>\d+)/edit$', views.edit_annotation_content),
    url(r'^annotationreplies/(?P<id>\d+)/edit$', views.edit_annotation_reply_content),
]







