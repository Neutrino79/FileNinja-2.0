from django.db import models

# Create your models here.

class ContactDetails(models.Model):
    class Meta: 
        verbose_name_plural = "Inquiry Details"

    name = models.CharField(max_length=60)
    email = models.EmailField(max_length=50)
    subject = models.CharField(max_length=50)
    message = models.TextField()

