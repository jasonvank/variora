# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2018-07-19 03:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0009_auto_20180706_2257'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='external_portrait_url',
            field=models.TextField(blank=True, null=True),
        ),
    ]