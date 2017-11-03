from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'users/(?P<pk>\d+)', views.UserAPIView.as_view()),
    
    url(r'search', views.search_api_view),
]
