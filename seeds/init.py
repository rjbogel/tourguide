from flask_seeder import Seeder, Faker, generator
from flaskr.models import User, AuthGroup
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd


class InitSeeder(Seeder):
    def run(self):
        users = [
            User(email="admin@gmail.com", username="admin",
                 name="Admin", password="admin", group_id=1),
        ]
        groups = [
            AuthGroup(name="admin"),
        ]

        for user in users:
            print("Adding user: %s" % user)
            self.db.session.add(user)
        for group in groups:
            print("Adding user to group: %s" % group)
            self.db.session.add(group)