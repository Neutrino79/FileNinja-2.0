from django.urls import path

from . import views

app_name = "file_converter"

urlpatterns = [
    path("", views.pdf_to_docx_view, name="pdf_to_docx"),
]