import urllib

from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.utils.decorators import method_decorator
from django.views.generic import View

from models import Annotation, AnnotationReply, Comment, Document


def edit_doc_title(request):
    document = Document.objects.get(id=int(request.POST["document_id"]))
    new_doc_title = request.POST["new_doc_title"]
    document.title = new_doc_title
    document.save()
    return HttpResponse()


class FileViewerView(View):
    @method_decorator(login_required(login_url='/'))
    def post(self, request):
        if request.POST["operation"] == "delete_annotation":
            annotation = Annotation.objects.get(id=int(request.POST["annotation_id"]))
            annotation.delete()
            return HttpResponse()

        elif request.POST["operation"] == "delete_annotation_reply":
            document = Document.objects.get(id=int(request.POST["document_id"]))
            reply_annotation = AnnotationReply.objects.get(id=int(request.POST["reply_id"]))
            reply_annotation.delete()
            context = {
                "document": document,
                "annotations": document.annotation_set.order_by("page_index"),
            }
            return render(request, "file_viewer/annotation_viewer_subpage.html", context)

        elif request.POST["operation"] == "delete_comment":
            document = Document.objects.get(id=int(request.POST["document_id"]))
            comment = Comment.objects.get(id=int(request.POST["comment_id"]))
            comment.delete()
            context = {
                "document": document,
                "comments": document.comment_set.order_by("-post_time"),
            }
            return render(request, "file_viewer/comment_viewer_subpage.html", context)

        elif request.POST["operation"] == "like_annotation":
            annotation = Annotation.objects.get(id=int(request.POST["annotation_id"]))
            annotation.num_like += 1
            annotation.save()
            return HttpResponse()

        elif request.POST["operation"] == "like_annotation_reply":
            annotation_reply = AnnotationReply.objects.get(id=int(request.POST["annotation_reply_id"]))
            annotation_reply.num_like += 1
            annotation_reply.save()
            return HttpResponse()

        elif request.POST["operation"] == "like_comment":
            comment = Comment.objects.get(id=int(request.POST["comment_id"]))
            comment.num_like += 1
            comment.save()
            return HttpResponse()

        elif request.POST["operation"] == "collect":
            user = get_user(request)
            document = Document.objects.get(id=int(request.POST["document_id"]))
            document.collectors.add(user)
            document.save()
            return HttpResponse()

        elif request.POST["operation"] == "uncollect":
            user = get_user(request)
            document = Document.objects.get(id=int(request.POST["document_id"]))
            document.collectors.remove(user)
            document.save()
            return HttpResponse()

        elif request.POST["operation"] == "refresh":
            document = Document.objects.get(id=int(request.POST["document_id"]))
            context = {
                "document": document,
                "comments": document.comment_set.order_by("-post_time"),
            }
            return render(request, "file_viewer/comment_viewer_subpage.html", context)

        elif request.POST["operation"] == "comment":
            document = Document.objects.get(id=int(request.POST["document_id"]))
            if request.POST["comment_content"] != "":
                comment = Comment()
                comment.content = request.POST["comment_content"]
                comment.commenter = get_user(request)
                comment.document_this_comment_belongs = document
                if "reply_to_comment_id" in request.POST:
                    comment.reply_to_comment = Comment.objects.get(id=int(request.POST["reply_to_comment_id"]))
                comment.save()
            context = {
                "document": document,
                "comments": document.comment_set.order_by("-post_time"),
            }
            return render(request, "file_viewer/comment_viewer_subpage.html", context)

        elif request.POST["operation"] == "annotate":
            document = Document.objects.get(id=int(request.POST["document_id"]))
            annotation = Annotation()
            annotation.content = request.POST["annotation_content"]
            annotation.annotator = get_user(request)
            annotation.document_this_annotation_belongs = document
            annotation.page_index = request.POST["page_id"].split("_")[2]
            annotation.height_percent = request.POST["height_percent"]
            annotation.width_percent = request.POST["width_percent"]
            annotation.top_percent = request.POST["top_percent"]
            annotation.left_percent = request.POST["left_percent"]
            annotation.frame_color = request.POST["frame_color"]
            annotation.is_public = True if request.POST["is_public"] == 'true' else False
            annotation.save()
            context = {
                "document": document,
                "annotations": document.annotation_set.order_by("page_index"),
                "new_annotation_id": annotation.id,
            }
            return JsonResponse({
                'new_annotations_html': render(request, "file_viewer/annotation_viewer_subpage.html", context).content,
                'new_annotation_id': annotation.id
            })

        elif request.POST["operation"] == "reply_annotation":
            document = Document.objects.get(id=int(request.POST["document_id"]))
            if request.POST["annotation_reply_content"] != "":
                annotation_reply = AnnotationReply()
                annotation = Annotation.objects.get(id=int(request.POST["reply_to_annotation_id"]))
                annotation_reply.content = request.POST["annotation_reply_content"]
                annotation_reply.replier = get_user(request)
                annotation_reply.reply_to_annotation = annotation
                if request.POST.has_key("reply_to_annotation_reply_id"):
                    annotation_reply.reply_to_annotation_reply = AnnotationReply.objects.get(id=int(request.POST["reply_to_annotation_reply_id"]))
                annotation_reply.save()
            context = {
                "document": document,
                "annotations": document.annotation_set.order_by("page_index"),
            }
            return render(request, "file_viewer/annotation_viewer_subpage.html", context)

    def get(self, request):
        document = Document.objects.get(id=int(request.GET["document_id"]))

        user = get_user(request)
        collected = False
        if user.is_authenticated() and document in user.collected_document_set.all():
            collected = True

        document.num_visit += 1
        document.save()

        context = {
            "document": document,
            "file_url": document.url,
            "comments": document.comment_set.order_by("-post_time"),
            "annotations": document.annotation_set.order_by("page_index"),
            "collected": collected,
            "prev_page_url": request.META['HTTP_REFERER'] if 'HTTP_REFERER' in request.META else '/'
        }
        return render(request, "file_viewer/pdf_file_viewer_page.html", context)
