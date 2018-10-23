from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder

from ..models import User


class UserEncoder(DjangoJSONEncoder):
    def default(self, obj):
        if isinstance(obj, AnonymousUser):
            return {
                'is_authenticated': obj.is_authenticated,
            }
        if isinstance(obj, User):
            return {
                'pk': obj.pk,
                'email_address': obj.email_address,
                'nickname': obj.nickname,
                'portrait_url': obj.portrait_url,
                'date_joined': obj.date_joined,
                'is_authenticated': obj.is_authenticated,
                'is_superuser': obj.is_superuser,
                'setting:': obj.setting,
            }
        return super(UserEncoder, self).default(obj)

