from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_before_login, name="home"),

    path('loggedin/', views.index_after_login, name="home1"),
    path('accounts/sign_up/', views.sign_up, name="sign-up"),
    path('accounts/digitrecognizer/', views.DigitRecognizer, name="DigitRecognizer"),
    path('accounts/additionDigits/', views.AdditionDigits, name="DigitRecognizer"),
    path('accounts/result/', views.result, name="Result")
]