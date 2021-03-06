from django.conf.urls import include, url
from django.views.generic import TemplateView

from . import views

urlpatterns = [  # obsolete UI pages
    url(r'^sign_up', views.display_sign_up_page),

    url(r'^handle_sign_up', views.handle_sign_up, name="handle_sign_up"),

] + [  # new UI with react and restful APIs
    url(r'^api/', include('home.api.urls')),

    # url(r'^jason_test', views.jason_test),

    url(r'^sign-in$', views.display_sign_in_page),
    url(r'^make-pdf$', views.display_make_pdf_page),

    url(r'^sw$', views.service_worker),

    # using igmur (free public image hostring), so do not open this url
    # url(r'^upload-image$', views.handle_image_upload),

    # index using react router
    url(r'^$', views.display_index),
    url(r'^collected', views.display_index),
    url(r'^subscribed', views.display_index),
    url(r'^groups', views.display_index),
    url(r'^readlists', views.display_index),
    url(r'^search', views.display_index),
    url(r'^explore', views.display_index_explore),

    # service workers
    url(r'firebase-messaging-sw.js', TemplateView.as_view(template_name='firebase-messaging-sw.js', content_type='application/x-javascript')),

    # pwa
    url(r'^settings', views.display_index),
    url(r'^uploads', views.display_index),
    url(r'^notifications', views.display_index),
    url(r'^profile', views.display_index),
]
