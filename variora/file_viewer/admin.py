from django.contrib import admin
import models


class DocumentModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "title", "owner", "size", "num_visit", "unique_file", 'upload_time']
    list_filter = ["title", "unique_file", "owner"]
    search_fields = ["id", 'uuid', "title", "unique_file__file_field", "owner__nickname"]
    filter_horizontal = ['collectors']


class ReadlistModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', 'name']
    filter_horizontal = ['collectors', 'documents']


class UniqueFileModelAdmin(admin.ModelAdmin):
    list_display = ["id", "file_field", "size", "md5"]
    list_filter = ["file_field", "md5"]
    search_fields = ["id", "file_field", "md5"]


class CommentModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "document_this_comment_belongs", "commenter", "num_like", "post_time", "is_public", "content"]
    list_filter = ["document_this_comment_belongs", "commenter", "num_like", "is_public"]
    search_fields = ["id", 'uuid', "content", "document_this_comment_belongs", "commenter__nickname", "num_like"]


class AnnotationModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "document_this_annotation_belongs", "annotator", "num_like", "post_time", "edit_time", "is_public", "content"]
    list_filter = ["document_this_annotation_belongs", "annotator", "num_like", "is_public"]
    search_fields = ["id", 'uuid', "content", "document_this_annotation_belongs__title", "annotator__nickname", "num_like"]


class AnnotationReplyModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like", "post_time", "edit_time", "is_public", "content"]
    list_filter = ["reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like", "is_public"]
    search_fields = ["id", 'uuid', "content", "reply_to_annotation__content", "reply_to_annotation_reply__content", "replier__nickname", "num_like"]


class DocumentThumbnailModelAdmin(admin.ModelAdmin):
    list_display = ['id', 'document', 'thumbnail_image', 'description', 'create_time']
    list_filter = ['description']


admin.site.register(models.Document, DocumentModelAdmin)
admin.site.register(models.Readlist, ReadlistModelAdmin)
admin.site.register(models.UniqueFile, UniqueFileModelAdmin)
admin.site.register(models.Comment, CommentModelAdmin)
admin.site.register(models.Annotation, AnnotationModelAdmin)
admin.site.register(models.AnnotationReply, AnnotationReplyModelAdmin)
admin.site.register(models.DocumentThumbnail, DocumentThumbnailModelAdmin)
