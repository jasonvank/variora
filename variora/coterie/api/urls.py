from django.conf.urls import url, include

from . import views


urlpatterns = [
    url(r'^coteries$', views.CoterieListView.as_view()),

    url(r'^coteries/(?P<pk>\d+)$', views.CoterieView.as_view()),
    url(r'^coteries/(?P<coterie_uuid>[0-9a-f-]+)/search$', views.search_api_view),
    url(r'^coteries/(?P<pk>\d+)/(?P<operation>\w+)$', views.CoterieView.as_view()),

    url(r'^coteries/create$', views.create_coterie),

    url(r'^coteriedocuments/(?P<pk>\d+)$', views.CoterieDocumentView.as_view()),
    url(r'^coteriedocuments/(?P<pk>\d+)/(?P<operation>\w+)$', views.CoterieDocumentView.as_view()),
    url(r'^coteriedocuments/byslug/(?P<slug>[0-9A-Za-z_\-]+)$', views.get_coteriedocument_by_slug),
    url(r'^coteriedocuments/byslug/(?P<slug>[0-9A-Za-z_\-]+)/annotations$', views.get_coteriedocument_annotations_by_slug),

    url(r'^coteriedocuments/upload$', views.post_upload_coteriedocument),

    url(r'^annotations/(?P<id>\d+)/content$', views.get_annotation_content),
    url(r'^annotationreplies/(?P<id>\d+)/content$', views.get_annotation_reply_content),

    url(r'^annotations/(?P<id>\d+)/edit$', views.edit_annotation_content),
    url(r'^annotationreplies/(?P<id>\d+)/edit$', views.edit_annotation_reply_content),
] + [

    url(r'^coteries/(?P<coterie_uuid>[0-9a-f-]+)/members/me/uploaded-documents$', views.get_uploaded_documents_for_member),

] + [

    url(r'^invite$', views.create_invitation),

    url(r'^invitations$', views.InvitationsView.as_view()),

    url(r'^invitations/(?P<pk>\d+)$', views.InvitationView.as_view()),

    url(r'^invitations/(?P<pk>\d+)/(?P<operation>\w+)', views.InvitationView.as_view()),

] + [

    url(r'^apply$', views.create_application),

    url(r'^applications$', views.ApplicationsView.as_view()),

    url(r'^applications/(?P<pk>\d+)$', views.ApplicationView.as_view()),

    url(r'^applications/(?P<pk>\d+)/(?P<operation>\w+)', views.ApplicationView.as_view()),

]







