from django.contrib import admin
from models import Coterie
from models import CoterieDocument
from models import CoterieAnnotation
from models import CoterieAnnotationReply
from models import CoterieComment
from models import CoterieInvitation
from models import CoterieApplication


class CoterieModelAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "description"]
    list_filter = ["id", "name", "administrators", "members", "applicants"]
    search_fields = ["id", "name", "administrators", "members", "applicants"]
    filter_horizontal = ["administrators", "members", "applicants"]


class CoterieInvitationAdmin(admin.ModelAdmin):
    list_display = ["id", "inviter", "invitee", "acceptance"]
    list_filter = ["id", "inviter", "invitee", "acceptance"]
    search_fields = ["id", "inviter", "invitee"]


class CoterieApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "coterie", "applicant", "acceptance"]
    list_filter = ["id", "coterie", "applicant", "acceptance"]
    search_fields = ["id", "coterie", "applicant"]


class CoterieDocumentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "title", "unique_file", "owner", "file_on_server"]
    list_filter = ["id", "title", "unique_file", "owner"]
    search_fields = ["id", "title", "unique_file", "owner"]


class CoterieAnnotationModelAdmin(admin.ModelAdmin):
    list_display = ["id", "content", "document_this_annotation_belongs", "page_index",  "annotator", "num_like"]
    list_filter = ["id", "content", "document_this_annotation_belongs", "annotator", "num_like"]
    search_fields = ["id", "content", "document_this_annotation_belongs", "annotator", "num_like"]


class CoterieAnnotationReplyModelAdmin(admin.ModelAdmin):
    list_display = ["id", "content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]
    list_filter = ["id", "content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]
    search_fields = ["id", "content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]


class CoterieCommentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "content", "document_this_comment_belongs", "commenter", "num_like"]
    list_filter = ["id", "content", "document_this_comment_belongs", "commenter", "num_like"]
    search_fields = ["id", "content", "document_this_comment_belongs", "commenter", "num_like"]


admin.site.register(Coterie, CoterieModelAdmin)
admin.site.register(CoterieDocument, CoterieDocumentModelAdmin)
admin.site.register(CoterieAnnotation, CoterieAnnotationModelAdmin)
admin.site.register(CoterieComment, CoterieCommentModelAdmin)
admin.site.register(CoterieAnnotationReply, CoterieAnnotationReplyModelAdmin)
admin.site.register(CoterieInvitation, CoterieInvitationAdmin)
admin.site.register(CoterieApplication, CoterieApplicationAdmin)
