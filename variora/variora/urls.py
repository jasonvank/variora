"""variora URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps import Sitemap
from django.contrib.sitemaps.views import sitemap

import proxy_views
from file_viewer.models import Document
from home.api import views_notifications


class DocumentSitemap(Sitemap):
    changefreq = "daily"

    def items(self):
        return Document.objects.all()[0:380]

    def lastmod(self, document):
        return document.upload_time

    def location(self, document):
        return '/documents/' + document.slug + '/' + document.title.replace(' ', '-')


custom_notifications_urls = [
    url(r'^api/unread$', views_notifications.get_unread_notification_list),

    url(r'^api/notifications/(?P<slug>\d+)/mark-read$', views_notifications.mark_notification_as_read),
]

urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    # app: admin
    url(r'^admin/', admin.site.urls),

    url('sitemap.xml', sitemap, {'sitemaps': {'documents': DocumentSitemap}}, name='django.contrib.sitemaps.views.sitemap'),

    # serve remote servers' pdf file (to fix CORS issue)
    url(r'^proxy$', proxy_views.proxy_view),

    url(r'^notifications/', include(custom_notifications_urls)),

    # app: file_viewer
    url(r'^file_viewer/', include('file_viewer.urls')),
    url(r'^documents/', include('file_viewer.urls')),

    # app: user_dashboard
    # url(r'^user_dashboard/', include('user_dashboard.urls')),

    # app: coterie
    url(r'^coterie/', include('coterie.urls')),
    url(r'^coteries/', include('coterie.urls')),

    # MUST BE THE LAST ONE
    url(r'^', include('home.urls')),
]
