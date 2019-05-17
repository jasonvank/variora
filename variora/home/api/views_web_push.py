from fcm_django.models import FCMDevice
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.views.generic import View
import json

from ..models import User

# handles the deletion of rows in the table generated by django-fcm
def delete_device(request):
    # TODO: handle error cases
    registration_id = json.loads(request.body)['token_id']
    devices = FCMDevice.objects.filter(registration_id=registration_id).all()
    for device in devices:
        if device.user == request.user:
            device.delete()
    return HttpResponse(status=200)
