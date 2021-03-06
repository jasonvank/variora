# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-07-03 04:46
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


APP = 'coterie'
MODEL_NAMES = [
    'Coterie', 'CoterieInvitation', 'CoterieApplication',
    'CoterieDocument', 'CoterieComment', 'CoterieAnnotation',
    'CoterieAnnotationReply'
]
FIELD_NAME = 'uuid'


def create_uuid(apps, schema_editor):
    for name in MODEL_NAMES:
        model = apps.get_model(APP, name)
        for obj in model.objects.all():
            obj.uuid = uuid.uuid4()
            obj.save()


addFieldToModelsOperations = [
    migrations.AddField(
        model_name=name.lower(),
        name=FIELD_NAME,
        field=models.UUIDField(null=True),
    ) for name in MODEL_NAMES
]

alterFieldToModelsOperations = [
    migrations.AlterField(
        model_name=name.lower(),
        name=FIELD_NAME,
        field=models.UUIDField(unique=True, null=False, default=uuid.uuid4, editable=False),
    ) for name in MODEL_NAMES
]


class Migration(migrations.Migration):

    dependencies = [
        (APP, '0012_auto_20180623_0150'),
    ]

    operations = addFieldToModelsOperations + [migrations.RunPython(create_uuid)] + alterFieldToModelsOperations
