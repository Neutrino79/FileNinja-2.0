from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.


@csrf_exempt
def pdf_to_docx_view(request):
    if request.method == 'POST':
        # Process the files, rotations, and passwords
        # For simplicity, we'll just return a dummy response
        print("submited")

    return render(request, 'file_converter/pdf_to_docx.html')