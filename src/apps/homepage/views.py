from django.shortcuts import render

from .models import ContactDetails

from time import sleep
from django.http import JsonResponse

# Create your views here.

def home_view(request):
    return render(request, 'homepage/index.html')

def saveContact(request):
    saved = False

    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        subject = request.POST.get("subject")
        message = request.POST.get("message")

        obj = ContactDetails(name=name, email=email, subject=subject, message=message)
        obj.save()
        saved = True
        sleep(0.75)
    
    return  JsonResponse({'success': saved})
