import random
import requests

from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.core.mail import \
    EmailMessage  # for sending verification using e-mail
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie

from coterie.models import Coterie
from file_viewer.models import Document
from home.models import UploadedImage, User
from variora.utils import *


def display_sign_up_page(request):
    return render(request, "home/sign_up_page.html")


@ensure_csrf_cookie
def display_sign_in_page(request):
    if should_return_pwa(request) and settings.ENABLE_PWA:
        return render(request, 'home/pwa.html')
    return render(request, "home/sign_in_page.html", {'DEBUG': settings.DEBUG})


def display_make_pdf_page(request):
    return render(request, "home/images_to_pdf.html", {'DEBUG': settings.DEBUG})


# temp_user_information_dic is a python dictionary
# the key is the email address
# the value is a 2-item list
#   the 1 st item is the user whose signing-up email is the key
#   the 2 nd item is the verification code for this user
temp_user_information_dic = {}


def handle_sign_up(request):
    post_result_dic = request.POST
    global temp_user_information_dic

    if post_result_dic.__contains__("username"):
        new_user = User()
        new_user.set_nickname(post_result_dic["username"])

        if post_result_dic.__contains__("email_address"):
            new_user.set_email_address(post_result_dic["email_address"])

            # send verification code by email
            verification_code = random.randint(0, 99999)
            verification_code_str = str(verification_code).zfill(5)
            correct_verification_code_str = verification_code_str
            verification_email = EmailMessage("verification code",
                                              verification_code_str,
                                              "obitoonepatchman@gmail.com",
                                              [post_result_dic["email_address"]])
            verification_email.send(fail_silently=False)

            if post_result_dic.__contains__("password"):
                new_user.set_password(post_result_dic["password_confirm"])

                # when a user finish the first step of signing up,
                # store a new user and his/her verification code in temp_user_information_dic
                temp_user_information_dic[post_result_dic["email_address"]] = [new_user, correct_verification_code_str]
                return HttpResponse()

    elif post_result_dic.__contains__("verification_code"):
        email_address = post_result_dic["email_address"]
        this_user_information = temp_user_information_dic[email_address]
        if post_result_dic["verification_code"] == this_user_information[1]:
            this_user_information[0].save()

            # when a user finish signing up and leave the sign_up_page,
            # delete his/her temp information stored in temp_user_information_dic
            del temp_user_information_dic[email_address]
            return HttpResponse()
        else:
            return HttpResponse("wrong")

    # when a user leave the sign_up_page,
    # delete his/her temporary information stored in temp_user_information_dic
    elif post_result_dic.__contains__("leave"):
        email_address = post_result_dic["email_address"]
        del temp_user_information_dic[email_address]


def display_index(request):
    if should_return_pwa(request) and settings.ENABLE_PWA:
        if not request.user.is_authenticated:
            return redirect('/sign-in')
        return render(request, 'home/pwa.html')
    else:
        if not request.user.is_authenticated and '/readlists/' not in request.path and '/search' not in request.path:
            return redirect('/explore')
        return render(request, 'home/test.html', {'DEBUG': settings.DEBUG})


def display_index_explore(request):
    if should_return_pwa(request) and settings.ENABLE_PWA:
        return render(request, 'home/pwa.html')
    return render(request, 'home/test.html', {'DEBUG': settings.DEBUG})


def jason_test(request):
    return render(request, 'home/jason_test.html', {})


def handle_image_upload(request):
    return HttpResponse(status=404)
    # user = request.user
    # if not user.is_authenticated:
    #     return HttpResponse(status=403)
    # file_uploaded = request.FILES["file_upload"]
    # if file_uploaded.size > 1024 * 500:  # 500 KB
    #     return HttpResponse(status=403)
    # uploaded_image = UploadedImage(image_field=file_uploaded, uploader=user)
    # uploaded_image.save()
    # return JsonResponse({
    #     'url': uploaded_image.image_field.url
    # })


def service_worker(request):
    content = requests.get(request.scheme + '://' + request.META['HTTP_HOST'] + '/static/service-worker.js').text
    response = HttpResponse(content, content_type='application/javascript')
    return response

