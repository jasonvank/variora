from django.conf.urls import url, include

from . import views, views_readlist

urlpatterns = [
    url(r'^documents/(?P<pk>\d+)$', views.DocumentView.as_view()),
    url(r'^documents/(?P<pk>\d+)/(?P<operation>\w+)', views.DocumentView.as_view()),
    url(r'^documents/byslug/(?P<slug>[0-9A-Za-z_\-]+)$', views.get_document_by_slug),
    url(r'^documents/byslug/(?P<slug>[0-9A-Za-z_\-]+)/annotations$', views.get_document_annotations_by_slug),

    url(r'^documents$', views.DocumentListView.as_view()),

    url(r'^documents/explore$', views.get_top_document_thumbnails),

    url(r'^annotations/(?P<id>\d+)/content$', views.get_annotation_content),
    url(r'^annotationreplies/(?P<id>\d+)/content$', views.get_annotation_reply_content),

    url(r'^annotations/(?P<id>\d+)/edit$', views.edit_annotation_content),
    url(r'^annotationreplies/(?P<id>\d+)/edit$', views.edit_annotation_reply_content),

    # readlist views
    url(r'^readlists/explore$', views_readlist.get_top_readlists),
    url(r'^readlists/create$', views_readlist.create_readlist),
    url(r'^readlists$', views_readlist.ReadlistListView.as_view()),
    url(r'^readlists/(?P<slug>[0-9A-Za-z_\-]+)$', views_readlist.ReadlistView.as_view()),
    url(r'^readlists/(?P<slug>[0-9A-Za-z_\-]+)/(?P<operation>\w+)', views_readlist.ReadlistView.as_view()),
]







