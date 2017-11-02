from __future__ import unicode_literals

from django.db import models
from file_viewer.models import Document
from home.models import User

# class Album(models.Model):
#     name = models.CharField(max_length=256)
#     introduction = models.TextField()
#     owner = models.ForeignKey(User)
#     documents = models.ManyToManyField(Document, related_name="belong_album_set", blank=True)
