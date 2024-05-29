from django.shortcuts import render

# Create your views here.


def pdf_to_docx_view(request):
    return render(request, 'file_converter/pdf_to_docx.html')