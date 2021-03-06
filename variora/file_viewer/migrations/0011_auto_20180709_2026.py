# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-07-09 12:26
from __future__ import unicode_literals

from django.db import migrations, models
import file_viewer.models


class Migration(migrations.Migration):

    dependencies = [
        ('file_viewer', '0010_auto_20180709_1957'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='documentthumbnail',
            name='open_url',
        ),
        migrations.RemoveField(
            model_name='documentthumbnail',
            name='title',
        ),
        migrations.AlterField(
            model_name='documentthumbnail',
            name='thumbnail_image',
            field=models.ImageField(upload_to=file_viewer.models.thumbnail_upload_to),
        ),
    ]
