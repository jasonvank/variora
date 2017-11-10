from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^coteries$', views.CoterieListView.as_view()),
]







