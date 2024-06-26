from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from .models import User, Destinasi
from . import db

views = Blueprint("views", __name__)


@views.route("/")
def index():
    return render_template(
        "page/landing.html",
        page="landing",
    )
