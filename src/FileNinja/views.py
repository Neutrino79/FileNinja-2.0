from django.shortcuts import render, redirect

def home_view(request):
    print("Home view called")
    return render(request, 'index.html')
