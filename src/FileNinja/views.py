from django.shortcuts import render, redirect

def home(request):
    print("view called")
    return render(request, 'index.html')
