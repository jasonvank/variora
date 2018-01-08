from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^coteries$', views.CoterieListView.as_view()),
    
    url(r'^coteries/create$', views.create_coterie),

    url(r'^coteriedocuments/(?P<pk>\d+)$', views.CoterieDocumentView.as_view()),

    url(r'^coteriedocuments/(?P<pk>\d+)/(?P<operation>\w+)', views.CoterieDocumentView.as_view()),
]







