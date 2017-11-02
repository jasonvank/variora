from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.FileViewerView.as_view(), name="file_viewer"),

    url(r'^edit_doc_title', views.edit_doc_title),

    url(r'^api/documents/(?P<pk>\d+)$', views.DocumentView.as_view(), name="document_restfu_api"),

    url(r'^api/documents/(?P<pk>\d+)/(?P<operation>\w+)', views.DocumentView.as_view(), name="document_restfu_api"),
]
