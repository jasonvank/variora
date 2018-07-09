import os
import re
from hashlib import md5

from django.contrib.auth import get_user, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import redirect, render

from django.conf import settings
from coterie.models import Coterie
from file_viewer.models import Document, UniqueFile
from home.models import User


def handle_log_out(request):
    logout(request)
    return redirect("home")


def _handle_dropbox_link(link):
    if link.endswith('dl=0'):
        link = link.replace('dl=0', 'raw=1')
    return link


def handle_file_upload(request):
    user = get_user(request)
    if 'title' not in request.POST or request.POST['title'] == '':
        return HttpResponse(status=403)
    if isinstance(user, AnonymousUser):
        return HttpResponse(status=403)

    if "external_url" in request.POST and request.POST["external_url"] != "":
        external_url = request.POST['external_url']
        if external_url.startswith('https://www.dropbox.com'):
            external_url = _handle_dropbox_link(external_url)
        document = Document(owner=user, external_url=external_url, title=request.POST["title"])
        document.save()
    else:
        file_upload = request.FILES["file_upload"]  # this is an UploadedFile object

        if file_upload.size > settings.MAX_DOCUMENT_UPLOAD_SIZE:
            return HttpResponse(status=403)

        this_file_md5 = md5(file_upload.read()).hexdigest()
        try:
            unique_file = UniqueFile.objects.get(md5=this_file_md5)
        except ObjectDoesNotExist:
            unique_file = UniqueFile(file_field=file_upload, md5=this_file_md5)
            unique_file.save()

        document = Document(owner=user, unique_file=unique_file, title=request.POST["title"])
        document.save()
    return HttpResponse(status=200)


def handle_uncollect(request):
    user = get_user(request)
    document = Document.objects.get(id=int(request.POST["document_id"]))
    document.collectors.remove(user)
    document.save()
    return redirect("user_dashboard")


def handle_follow_user(request):
    follow_target_user_id = request.POST['user_id']
    user = get_user(request)
    follow_target_user = User.objects.get(id=follow_target_user_id)
    user.following_users.add(follow_target_user)
    user.save()
    return redirect("friends_page")


def handle_unfollow_user(request):
    follow_target_user_id = request.POST['user_id']
    user = get_user(request)
    follow_target_user = User.objects.get(id=follow_target_user_id)
    user.following_users.remove(follow_target_user)
    user.save()
    return redirect('friends_page')


@login_required(login_url='/')
def display_user_dashboard(request):
    context = {
        "current_user": get_user(request),
        "page_type": "documents_page",
    }
    return render(request, "user_dashboard/documents_page.html", context)


@login_required(login_url='/')
def display_friends_page(request):
    context = {
        "current_user": get_user(request),
        "page_type": "friends_page",
    }
    return render(request, "user_dashboard/friends_page.html", context)


@login_required(login_url='/')
def display_group_page(request):
    role = request.GET["coterie_type"]
    context = {
        "current_user": get_user(request),
        "coterie": Coterie.objects.get(id=request.GET["coterie_id"]),
        "page_type": role + "_" + "coterie_page",
    }
    if role == "administrated":
        return render(request, "user_dashboard/administrated_coterie_page.html", context)
    elif role == "joined":
        return render(request, "user_dashboard/joined_coterie_page.html", context)


@login_required(login_url='/')
def display_friend_page(request):
    context = {
        "current_user": get_user(request),
        "friend": User.objects.get(id=request.GET["friend_id"]),
        "page_type": "friend_page",
    }
    return render(request, "user_dashboard/friend_page.html", context)


def change_portrait(request):
    if request.method == "GET":
        return render(request, "user_dashboard/change_portrait_page.html")

    elif request.method == "POST":
        user = get_user(request)

        # delete the local image file for the old portrait
        if user.portrait and hasattr(user.portrait, 'name'):
            previous_portrait = user.portrait
            img_location = previous_portrait.name
            previous_portrait.storage.delete(img_location)

        # store and set the new portrait
        portrait_dataurl = request.POST["portrait_dataurl"]

        # if the folder to store this user's portrait does exist, create it
        portrait_dir_path = os.path.join(settings.MEDIA_ROOT, "portrait", user.email_address)
        if not os.path.isdir(portrait_dir_path):
                os.mkdir(portrait_dir_path)

        portrait_png_file_path = os.path.join(portrait_dir_path, "portrait.png")

        # create the png file to be user's portrait and write data (portrait_dataurl) into it
        imgstr = re.search(r'base64,(.*)', portrait_dataurl).group(1)
        portrait_png_file = open(portrait_png_file_path, 'wb')
        portrait_png_file.write(imgstr.decode('base64'))
        portrait_png_file.close()

        # use the path relative to "media" folder to assign ImageField
        user.portrait = '{0}/{1}/{2}'.format("portrait", user.email_address, "portrait.png")

        user.save()

        return HttpResponse()  # ajax will make the user go back his/her user dashboard
