from django.contrib import admin
import models


class DocumentModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "title", "owner", "tags", "size", "num_visit", "unique_file", 'upload_time']
    search_fields = ["id", 'uuid', "title", "tags", "unique_file__file_field", "owner__nickname"]
    filter_horizontal = ['collectors']


class ReadlistModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', 'name', 'is_public', 'creator']
    search_fields = ['id', 'uuid', 'name', 'creator__nickname']
    list_filter = ['is_public']
    filter_horizontal = ['collectors', 'documents']


class UniqueFileModelAdmin(admin.ModelAdmin):
    list_display = ["id", "file_field", "size", "md5"]
    search_fields = ["id", "file_field", "md5"]


class CommentModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "document_this_comment_belongs", "commenter", "num_like", "post_time", "is_public", "content"]
    list_filter = ["document_this_comment_belongs", "commenter", "num_like", "is_public"]
    search_fields = ["id", 'uuid', "content", "document_this_comment_belongs", "commenter__nickname", "num_like"]


def make_anonymous(modeladmin, request, queryset):
    for obj in queryset:
        obj.is_public = False
        obj.save()


def make_public(modeladmin, request, queryset):
    for obj in queryset:
        obj.is_public = True
        obj.save()


make_anonymous.short_description = 'make anonymous'
make_public.short_description = 'make public'


class AnnotationModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "document_this_annotation_belongs", "annotator", "num_like", "post_time", "edit_time", "is_public", "content"]
    list_filter = ["is_public"]
    search_fields = ["id", 'uuid', "content", "document_this_annotation_belongs__title", "annotator__nickname", "num_like"]
    actions = [make_anonymous, make_public]


class AnnotationReplyModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', "replier", "num_like", "post_time", "edit_time", "is_public", "content", "reply_to_annotation", "reply_to_annotation_reply"]
    list_filter = ["is_public"]
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
