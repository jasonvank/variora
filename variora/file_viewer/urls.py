from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.FileViewerView.as_view(), name="file_viewer"),
    url(r'^(?P<title>[\w|\-|&]*)/(?P<pk>\d+)', views.FileViewerView.as_view(), name="file_viewer"),

    url(r'^edit_doc_title', views.edit_doc_title),

    url(r'^api/', include('file_viewer.api.urls')),
]
