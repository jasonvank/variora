from django.contrib import admin

from models import (Coterie, CoterieAnnotation, CoterieAnnotationReply,
                    CoterieApplication, CoterieComment, CoterieDocument,
                    CoterieInvitation, CoterieReadlist, InvitationCode,
                    NonRegisteredUserTempCoterieInvitation)


class CoterieModelAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "name", 'creator', "description"]
    list_filter = []
    search_fields = ["id", "uuid", "name", "administrators__pk", "members__pk"]
    filter_horizontal = ["administrators", "members"]


class CoterieInvitationAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "inviter", "invitee", "acceptance"]
    list_filter = ["acceptance"]
    search_fields = ["id", "uuid", "inviter__pk", "invitee__pk"]


class NonRegisteredUserTempCoterieInvitationAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "inviter", "invitee_email"]
    search_fields = ["id", "uuid", "inviter__pk", "invitee_email"]


class InvitationCodeAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "code"]
    search_fields = ["id", "uuid", "code"]


class CoterieApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "coterie", "applicant", "acceptance"]
    list_filter = ["coterie", "applicant", "acceptance"]
    search_fields = ["id", "uuid", "coterie__pk", "applicant__pk"]


class CoterieDocumentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "title", "unique_file", "owner", "size"]
    list_filter = []
    search_fields = ["id", "uuid", "title", "unique_file__pk", "owner__pk", "owner__name"]


class CoterieReadlistModelAdmin(admin.ModelAdmin):
    list_display = ["id", 'clean_uuid', 'name', 'is_public', 'creator']
    search_fields = ['id', 'uuid', 'name', 'creator__nickname']
    list_filter = ['is_public']
    filter_horizontal = ['collectors', 'documents']


class CoterieAnnotationModelAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "document_this_annotation_belongs", "page_index",  "annotator", "num_like", "edit_time", "content"]
    list_filter = ["content", "document_this_annotation_belongs", "annotator", "num_like"]
    search_fields = ["id", "uuid", "content", "document_this_annotation_belongs__pk", "annotator__pk", "num_like"]


class CoterieAnnotationReplyModelAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "replier", "num_like", "edit_time", "content", "reply_to_annotation", "reply_to_annotation_reply"]
    list_filter = ["content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]
    search_fields = ["id", "uuid", "content", "reply_to_annotation__pk", "reply_to_annotation_reply__pk", "replier__pk", "num_like"]


class CoterieCommentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "clean_uuid", "document_this_comment_belongs", "commenter", "num_like", "content"]
    list_filter = ["content", "document_this_comment_belongs", "commenter", "num_like"]
    search_fields = ["id", "uuid", "content", "document_this_comment_belongs__pk", "commenter__pk", "num_like"]


admin.site.register(Coterie, CoterieModelAdmin)
admin.site.register(CoterieDocument, CoterieDocumentModelAdmin)
admin.site.register(CoterieReadlist, CoterieReadlistModelAdmin)
admin.site.register(CoterieAnnotation, CoterieAnnotationModelAdmin)
admin.site.register(CoterieComment, CoterieCommentModelAdmin)
admin.site.register(CoterieAnnotationReply, CoterieAnnotationReplyModelAdmin)
admin.site.register(CoterieInvitation, CoterieInvitationAdmin)
admin.site.register(NonRegisteredUserTempCoterieInvitation, NonRegisteredUserTempCoterieInvitationAdmin)
admin.site.register(InvitationCode, InvitationCodeAdmin)
admin.site.register(CoterieApplication, CoterieApplicationAdmin)
