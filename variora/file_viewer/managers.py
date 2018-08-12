from django.db import models


class DocumentManager(models.Manager):
    def filter_with_related(self, *args, **kargs):
        return self.filter(*args, **kargs).select_related('unique_file').select_related('owner')


class DocumentThumbnailManager(models.Manager):
    def all_with_related(self, *args, **kargs):
        return self.all(*args, **kargs).select_related('document').select_related('document__owner')
