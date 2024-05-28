from django.contrib import admin

from .models import ContactDetails

# Register your models here.

class ContactService(admin.ModelAdmin):
    list_per_page = 10

    list_display = (
        'name',
        'email',
        'subject',
        'message'
    )

admin.site.register(ContactDetails, ContactService)
