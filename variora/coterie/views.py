import re
from hashlib import md5

from django.contrib.auth import get_user
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render

import models
import variora.settings as settings
from coterie.models import Coterie
from file_viewer import models as file_viewer_models
from home.models import User
from models import CoterieDocument


def handle_create_coterie(request):
    coterie = Coterie()
    coterie.name = request.POST["coterie_name"]
    coterie.description = request.POST["coterie_description"]
    coterie.save()
    coterie.administrators.add(get_user(request))
    return HttpResponse()


def handle_apply_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    applicant = get_user(request)
    if applicant not in coterie.members.all() and applicant not in coterie.administrators.all():
        coterie.applicants.add(applicant)
        coterie.save()
    return redirect("user_dashboard")


def handle_join_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    if get_user(request) in coterie.administrators.all():
        applicant = User.objects.get(id=request.POST["applicant_id"])
        coterie.applicants.remove(applicant)
        if request.POST["decision"] == "accept":
            coterie.members.add(applicant)
        elif request.POST["decision"] == "refuse":
            pass
        coterie.save()
        url_request_from = request.POST["current_url"]
        return redirect(url_request_from)
    else:
        return HttpResponse("<h1>Sorry, you are not an administrator</h1>")


def handle_quit_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    user = get_user(request)
    if user in coterie.members.all():
        coterie.members.remove(user)
        coterie.save()
    return redirect("user_dashboard")


def handle_delete_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    user = get_user(request)
    if user in coterie.administrators.all():
        coterie.delete()
    return redirect("user_dashboard")


def handle_remove_member(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    user = get_user(request)
    member = User.objects.get(id=request.POST["user_id"])
    if user in coterie.administrators.all() and member not in coterie.administrators.all():
        coterie.members.remove(member)
        coterie.save()
    url_request_from = request.POST["current_url"]
    return redirect(url_request_from)


def edit_coteriedoc_title(request):
    document = models.CoterieDocument.objects.get(id=int(request.POST["document_id"]))
    new_doc_title = request.POST["new_doc_title"]
    document.title = new_doc_title
    document.save()
    return HttpResponse()


def serve_coteriefile(request):
    document = models.CoterieDocument.objects.get(id=int(request.GET["document_id"]))
    file = document.unique_file
    file_position = file.file_field.storage.path(file.file_field)
    content = open(file_position, 'rb')
    response = HttpResponse(content, content_type='application/pdf')
    response['Content-Disposition'] = "attachment; filename=%s.pdf" % document.title
    return response


def display_coteriefile_viewer_page(request, **kwargs):
    if request.method == "POST":
        user = get_user(request)
        if 'pk' in kwargs:
            coterie = Coterie.objects.get(id=kwargs['coterie_id'])
            document = models.CoterieDocument.objects.get(pk=kwargs['pk'])
            if 'title' not in kwargs or document.title.replace(' ', '-') != kwargs['title']:
                return HttpResponse(status=404)
        else:
            coterie = Coterie.objects.get(id=request.GET["coterie_id"])
            document = models.CoterieDocument.objects.get(id=int(request.GET["document_id"]))
        if user not in coterie.administrators.all() and user not in coterie.members.all():
            return redirect("/")

        if request.POST["operation"] == "delete_annotation":
            annotation = models.CoterieAnnotation.objects.get(id=int(request.POST["annotation_id"]))
            annotation.delete()
            return HttpResponse()

        elif request.POST["operation"] == "delete_annotation_reply":
            reply_annotation = models.CoterieAnnotationReply.objects.get(id=int(request.POST["reply_id"]))
            reply_annotation.delete()
            context = {
                "document": document,
                "annotations": document.coterieannotation_set.order_by("page_index"),
            }
            return render(request, "coterie_file_viewer/annotation_viewer_subpage.html", context)

        elif request.POST["operation"] == "delete_comment":
            comment = models.CoterieComment.objects.get(id=int(request.POST["comment_id"]))
            comment.delete()
            context = {
                "document": document,
                "comments": document.coteriecomment_set.order_by("-post_time"),
            }
            return render(request, "file_viewer/comment_viewer_subpage.html", context)

        elif request.POST["operation"] == "like_comment":
            comment = models.CoterieComment.objects.get(id=int(request.POST["comment_id"]))
            comment.num_like += 1
            comment.save()
            return HttpResponse()

        elif request.POST["operation"] == "like_annotation":
            annotation = models.CoterieAnnotation.objects.get(id=int(request.POST["annotation_id"]))
            annotation.num_like += 1
            annotation.save()
            return HttpResponse()

        elif request.POST["operation"] == "like_annotation_reply":
            annotation_reply = models.CoterieAnnotationReply.objects.get(id=int(request.POST["annotation_reply_id"]))
            annotation_reply.num_like += 1
            annotation_reply.save()
            return HttpResponse()

        elif request.POST["operation"] == "refresh":
            context = {
                "document": document,
                "comments": document.coteriecomment_set.order_by("-post_time"),
            }
            return render(request, "coterie_file_viewer/comment_viewer_subpage.html", context)

        elif request.POST["operation"] == "comment":
            if request.POST["comment_content"] != "":
                comment = models.CoterieComment()
                comment.content = request.POST["comment_content"]
                comment.commenter = get_user(request)
                comment.document_this_comment_belongs = document
                if "reply_to_comment_id" in request.POST:
                    comment.reply_to_comment = models.CoterieComment.objects.get(
                        id=int(request.POST["reply_to_comment_id"]))
                comment.save()

            context = {
                "document": document,
                "comments": document.coteriecomment_set.order_by("-post_time"),
            }
            return render(request, "coterie_file_viewer/comment_viewer_subpage.html", context)

        elif request.POST["operation"] == "annotate":
            annotation = models.CoterieAnnotation()
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
                "annotations": document.coterieannotation_set.order_by("page_index"),
                "new_annotation_id": annotation.id,
            }

            return JsonResponse({
                'new_annotations_html': render(request, "coterie_file_viewer/annotation_viewer_subpage.html", context).content,
                'new_annotation_id': annotation.id
            })

        elif request.POST["operation"] == "reply_annotation":
            if request.POST["annotation_reply_content"] != "":
                annotation_reply = models.CoterieAnnotationReply()
                annotation = models.CoterieAnnotation.objects.get(id=int(request.POST["reply_to_annotation_id"]))
                annotation_reply.content = request.POST["annotation_reply_content"]
                annotation_reply.replier = get_user(request)
                annotation_reply.reply_to_annotation = annotation

                if "reply_to_annotation_reply_id" in request.POST:
                    annotation_reply.reply_to_annotation_reply = models.CoterieAnnotationReply.objects.get(
                        id=int(request.POST["reply_to_annotation_reply_id"]))

                annotation_reply.save()

            context = {
                "document": document,
                "annotations": document.coterieannotation_set.order_by("page_index"),
            }
            return render(request, "coterie_file_viewer/annotation_viewer_subpage.html", context)

    else:
        user = get_user(request)

        if 'pk' in kwargs:
            coterie = Coterie.objects.get(id=kwargs['coterie_id'])
            document = models.CoterieDocument.objects.get(pk=kwargs['pk'])
            if 'title' not in kwargs or document.title.replace(' ', '-') != kwargs['title']:
                return HttpResponse(status=404)
        else:
            coterie = Coterie.objects.get(id=request.GET["coterie_id"])
            document = models.CoterieDocument.objects.get(id=int(request.GET["document_id"]))

        if user not in coterie.administrators.all() and user not in coterie.members.all():
            return redirect("/")

        document.num_visit += 1
        document.save()

        context = {
            "document": document,
            "file_url": document.url,
            "comments": document.coteriecomment_set.order_by("-post_time"),
            "annotations": document.coterieannotation_set.order_by("page_index"),
            "prev_page_url": request.META['HTTP_REFERER'] if 'HTTP_REFERER' in request.META else '/'
        }
        return render(request, "coterie_file_viewer/pdf_file_viewer_page.html", context)


def _handle_dropbox_link(link):
    if link.endswith('dl=0'):
        link = link.replace('dl=0', 'raw=1')
    return link


def handle_coteriefile_upload(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])

    if get_user(request) in coterie.administrators.all():
        if 'external_url' in request.POST and request.POST['external_url'] != '':
            external_url = request.POST['external_url']
            if external_url.startswith('https://www.dropbox.com'):
                external_url = _handle_dropbox_link(external_url)
            document = CoterieDocument(owner=coterie, external_url=external_url, title=request.POST["title"])
            document.save()
        else:
            file_upload = request.FILES["file_upload"]  # this is an UploadedFile object
            this_file_md5 = md5(file_upload.read()).hexdigest()

            try:
                unique_file = models.UniqueFile.objects.get(md5=this_file_md5)
            except ObjectDoesNotExist:
                unique_file = models.UniqueFile(file_field=file_upload, md5=this_file_md5)
                unique_file.save()

            document = CoterieDocument(owner=coterie, unique_file=unique_file, title=request.POST["title"])
            document.save()  # save this document to the database

    url_request_from = request.POST["current_url"]
    return redirect(to=url_request_from)


def handle_coteriefile_delete(request):
    try:
        document = models.CoterieDocument.objects.get(id=int(request.POST["document_id"]))
        coterie = Coterie.objects.get(id=request.POST["coterie_id"])

        if document.owner == coterie and get_user(request) in coterie.administrators.all():
            document.delete()

        url_request_from = request.POST["current_url"]
        return redirect(to=url_request_from)
    except ObjectDoesNotExist:
        url_request_from = request.POST["current_url"]
        return redirect(to=url_request_from)
