import urllib

import html2text
from django.http import HttpResponse
from django.shortcuts import redirect

import models
from home.models import User

from .models import Coterie

h = html2text.HTML2Text()
h.ignore_images = True
h.ignore_emphasis = True
h.ignore_links = True


def handle_create_coterie(request):
    coterie = Coterie()
    coterie.name = request.POST["coterie_name"]
    coterie.description = request.POST["coterie_description"]
    coterie.save()
    coterie.administrators.add(request.user)
    return HttpResponse()


def handle_apply_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    applicant = request.user
    if applicant not in coterie.members.all() and applicant not in coterie.administrators.all():
        coterie.applicants.add(applicant)
        coterie.save()
    return redirect("user_dashboard")


def handle_join_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    if request.user in coterie.administrators.all():
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
    user = request.user
    if user in coterie.members.all():
        coterie.members.remove(user)
        coterie.save()
    return redirect("user_dashboard")


def handle_delete_coterie(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    if request.user in coterie.administrators.all():
        coterie.delete()
    return redirect("user_dashboard")


def handle_remove_member(request):
    coterie = Coterie.objects.get(id=request.POST["coterie_id"])
    user = request.user
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
    if document.file_on_server:
        content = document.unique_file.file_field.read()
    else:
        content = urllib.urlopen(document.external_url)
    response = HttpResponse(content, content_type='application/pdf')
    response['Content-Disposition'] = "attachment; filename=%s.pdf" % document.title
    return response
