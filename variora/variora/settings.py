"""
Django settings for variora project.

Generated by 'django-admin startproject' using Django 1.9.6.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.9/ref/settings/
"""

import os

from private_settings import *
from private_settings import DATABASES, DEBUG, SECRET_KEY

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.9/howto/deployment/checklist/

ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    # 3rd party apps
    'notifications',
    'kronos',
    'cachalot',
    'memcache_status',
    'django_user_agents',
    'anymail',
    'fcm_django',
    'taggit',

    # django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'django.contrib.postgres',

    # my apps
    'home',
    'file_viewer',
    'user_dashboard',
    'coterie',
]

MIDDLEWARE_CLASSES = [
    'django.middleware.gzip.GZipMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'django_user_agents.middleware.UserAgentMiddleware',
]

ROOT_URLCONF = 'variora.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'variora.wsgi.application'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
        'OPTIONS': {
            'server_max_value_length': 1024 * 1024 * 5,
        }
    },
    'redis': {
        'BACKEND': 'redis_cache.RedisCache',
        'LOCATION': 'localhost:6379',
    },
}

# Password validation
# https://docs.djangoproject.com/en/1.9/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

SESSION_ENGINE = "django.contrib.sessions.backends.cached_db"
SESSION_CACHE_ALIAS = 'default'

# Internationalization
# https://docs.djangoproject.com/en/1.9/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Singapore'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.9/howto/static-files/
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "bundled_static", 'dev'),
    os.path.join(BASE_DIR, "bundled_static", 'prod'),
]

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'


AUTH_USER_MODEL = 'home.User'
ANONYMOUS_USER_PORTRAIT_URL = '/media/portrait/anonymous_portrait.png'

FILE_UPLOAD_PERMISSIONS = 0664


############ cron job related ##############
KRONOS_MANAGE = os.path.join(BASE_DIR, 'manage.py')
CRON_CLASSES = []


############ Django Notifications ##########
NOTIFICATIONS_USE_JSONFIELD = True

MAX_DOCUMENT_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB


############ PWA ##########
ENABLE_PWA = True


############ Django Debug Toolbar ##########
# if DEBUG:
#     INTERNAL_IPS = ('127.0.0.1', 'localhost',)
#     MIDDLEWARE_CLASSES += (
#         # 'debug_toolbar.middleware.DebugToolbarMiddleware',
#         'debug_panel.middleware.DebugPanelMiddleware',
#     )

#     INSTALLED_APPS += (
#         'debug_toolbar',
#         'debug_panel',
#     )

#     DEBUG_TOOLBAR_PANELS = [
#         'debug_toolbar.panels.versions.VersionsPanel',
#         'debug_toolbar.panels.timer.TimerPanel',
#         'debug_toolbar.panels.settings.SettingsPanel',
#         'debug_toolbar.panels.headers.HeadersPanel',
#         'debug_toolbar.panels.request.RequestPanel',
#         'debug_toolbar.panels.sql.SQLPanel',
#         'debug_toolbar.panels.staticfiles.StaticFilesPanel',
#         'debug_toolbar.panels.templates.TemplatesPanel',
#         'debug_toolbar.panels.cache.CachePanel',
#         'debug_toolbar.panels.signals.SignalsPanel',
#         'debug_toolbar.panels.logging.LoggingPanel',
#         'debug_toolbar.panels.redirects.RedirectsPanel',
#     ]

#     DEBUG_TOOLBAR_CONFIG = {
#         'INTERCEPT_REDIRECTS': False,
#     }
