from django.apps import AppConfig


class FileConverterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.apps.file_converter'

    verbose_name = "File Converter Information"
