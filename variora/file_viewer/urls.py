from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.FileViewerView.as_view(), name="file_viewer"),

    url(r'^api/', include('file_viewer.api.urls')),

    url(r'^(?P<slug>[0-9A-Za-z_\-]+)/(?P<title>.*)', views.FileViewerView.as_view(), name="file_viewer"),
]
