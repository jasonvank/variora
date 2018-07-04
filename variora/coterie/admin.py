from django.contrib import admin
from models import Coterie
from models import CoterieDocument
from models import CoterieAnnotation
from models import CoterieAnnotationReply
from models import CoterieComment
from models import CoterieInvitation
from models import CoterieApplication


class CoterieModelAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "name", "description"]
    list_filter = ["name", "administrators", "members"]
    search_fields = ["id", "uuid", "name", "administrators", "members"]
    filter_horizontal = ["administrators", "members"]


class CoterieInvitationAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "inviter", "invitee", "acceptance"]
    list_filter = ["inviter", "invitee", "acceptance"]
    search_fields = ["id", "uuid", "inviter", "invitee"]


class CoterieApplicationAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "coterie", "applicant", "acceptance"]
    list_filter = ["coterie", "applicant", "acceptance"]
    search_fields = ["id", "uuid", "coterie", "applicant"]


class CoterieDocumentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "title", "unique_file", "owner", "file_on_server"]
    list_filter = ["title", "unique_file", "owner"]
    search_fields = ["id", "uuid", "title", "unique_file", "owner"]


class CoterieAnnotationModelAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "content", "document_this_annotation_belongs", "page_index",  "annotator", "num_like"]
    list_filter = ["content", "document_this_annotation_belongs", "annotator", "num_like"]
    search_fields = ["id", "uuid", "content", "document_this_annotation_belongs", "annotator", "num_like"]


class CoterieAnnotationReplyModelAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]
    list_filter = ["content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]
    search_fields = ["id", "uuid", "content", "reply_to_annotation", "reply_to_annotation_reply", "replier", "num_like"]


class CoterieCommentModelAdmin(admin.ModelAdmin):
    list_display = ["id", "uuid", "content", "document_this_comment_belongs", "commenter", "num_like"]
    list_filter = ["content", "document_this_comment_belongs", "commenter", "num_like"]
    search_fields = ["id", "uuid", "content", "document_this_comment_belongs", "commenter", "num_like"]


admin.site.register(Coterie, CoterieModelAdmin)
admin.site.register(CoterieDocument, CoterieDocumentModelAdmin)
admin.site.register(CoterieAnnotation, CoterieAnnotationModelAdmin)
admin.site.register(CoterieComment, CoterieCommentModelAdmin)
admin.site.register(CoterieAnnotationReply, CoterieAnnotationReplyModelAdmin)
admin.site.register(CoterieInvitation, CoterieInvitationAdmin)
admin.site.register(CoterieApplication, CoterieApplicationAdmin)
