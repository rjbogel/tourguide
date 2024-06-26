from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from .models import User
from . import db

views = Blueprint("views", __name__)


@views.route("/")
def index():
    return render_template(
        "page/landing.html",
        page="landing",
    )

@views.route("/chatbot")
def chatbot():
    return render_template(
        "page/chatbot.html",
        page="chatbot",
    )

@views.route("/dashboard")
def dashboard():
    return render_template(
        "page/dashboard/index.html",
        page="dashboard",
    )
