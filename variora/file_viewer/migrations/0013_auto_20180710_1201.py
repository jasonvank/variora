# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-07-10 04:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('file_viewer', '0012_documentthumbnail_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documentthumbnail',
            name='description',
            field=models.CharField(db_index=True, max_length=128),
        ),
    ]
