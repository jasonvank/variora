# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-07-07 14:03
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('coterie', '0015_auto_20180704_1323'),
    ]

    operations = [
        migrations.AddField(
            model_name='coteriedocument',
            name='upload_time',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
