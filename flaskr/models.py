from sqlalchemy import Column, Integer
from sqlalchemy.orm import declarative_base
from sqlalchemy_easy_softdelete.hook import IgnoredTable
from sqlalchemy_easy_softdelete.mixin import generate_soft_delete_mixin_class
from sqlalchemy.inspection import inspect
from . import db
from sqlalchemy.sql import func
from werkzeug.security import generate_password_hash, check_password_hash
from flask import url_for
from flask_login import UserMixin
from sqlalchemy_serializer import SerializerMixin
import json
from datetime import datetime
import locale
locale.setlocale(locale.LC_TIME, "id_ID")


# Create a Class that inherits from our class builder

class SoftDeleteMixin(generate_soft_delete_mixin_class(
    # This table will be ignored by the hook
    # even if the table has the soft-delete column
    ignored_tables=[IgnoredTable(table_schema="public", name="cars"),]
)):
    # type hint for autocomplete IDE support
    deleted_at: datetime


# Apply the mixin to your Models
Base = declarative_base()


class User(db.Model, UserMixin, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    username = db.Column(db.String(150), unique=True)
    name = db.Column(db.String(150))
    password_hash = db.Column(db.String(256))
    date_created = db.Column(db.DateTime(timezone=True), default=func.now())
    group_id = db.Column(db.Integer, db.ForeignKey("auth_group.id"))
    group = db.relationship("AuthGroup", backref="user")

    @property
    def password(self):
        raise AttributeError("Password is no readable")

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self) -> str:
        return "<Name %r>" % self.name


class AuthGroup(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
