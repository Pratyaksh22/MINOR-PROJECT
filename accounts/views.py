from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render


from .forms import SignUpForm


def index_before_login(request):
    return render(request, 'accounts/index(before login).html')

@login_required
def index_after_login(request):
    return render(request, 'accounts/index(after login).html')


def sign_up(request):
    context = {}
    form = SignUpForm(request.POST or None)
    if request.method == "POST":
        if form.is_valid():
            user = form.save()
            login(request, user)
            return render(request, 'accounts/index(after login).html')
    context['form'] = form
    return render(request, 'registration/sign_up.html', context)


@login_required
def DigitRecognizer(request):
    return render(request, 'accounts/DigitRecognizer.html')


@login_required
def AdditionDigits(request):
    return render(request, 'accounts/AdditionDigits.html')


@login_required
def result(request):
    return render(request, 'accounts/Result.html')

