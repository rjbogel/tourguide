from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from . import db
from .models import User, Destinasi, Distrik, Rute
from flask_login import login_user, logout_user, login_required, current_user
from flaskr.algoritma import AntColonyOptimization
import numpy as np

api = Blueprint("api", __name__)


@api.route("/login", methods=["POST"])
def login():
    username = request.form.get("username")
    password = request.form.get("password")
    remember = request.form.get("rememberMe") == "on"

    user = User.query.filter_by(username=username).first()
    if user:
        if (password) and user.verify_password(password):
            login_user(user, remember=remember)
            return {"toast": {
                "icon": "success",
                "title": "Login Berhasil"
            }, "login": True, "redirect": url_for('views.home')}, 200
        else:
            return {"toast": {
                "icon": "error",
                "title": "Password yang anda masukkan salah"
            }, "login": False}, 200
    else:
        return {"toast": {
                "icon": "error",
                "title": "Username tidak dapat ditemukan"
                }, "login": False}, 200


@api.route("/destinasi", methods=["GET", "POST"])
def destinasi():
    if request.method == 'POST':
        destinasi = Destinasi(id_distrik=request.form.get("id_distrik"),
                              nama=request.form.get("nama"),
                              deskripsi=request.form.get("deskripsi"),
                              latitude=request.form.get("latitude"),
                              longitude=request.form.get("longitude"))
        db.session.add(destinasi)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Destinasi baru berhasil ditambahkan"
        }, "data": destinasi.serialize()}, 200

    id_distrik = request.args.get("id_distrik")
    if (id_distrik):
        data = Destinasi.query.filter_by(id_distrik=id_distrik).all()
    else:
        data = Destinasi.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/destinasi/<id>", methods=["GET", "POST", "DELETE"])
def destinasibyid(id):
    data = Destinasi.query.get(id)
    if request.method == 'POST':
        data.id_distrik = request.form.get("id_distrik")
        data.nama = request.form.get("nama")
        data.deskripsi = request.form.get("deskripsi")
        data.latitude = request.form.get("latitude")
        data.longitude = request.form.get("longitude")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data Destinasi berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data Destinasi berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data Destinasi tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/distrik", methods=["GET", "POST"])
def distrik():
    if request.method == 'POST':
        distrik = Distrik(nama=request.form.get("distrik_nama"),
                          latitude=request.form.get("distrik_latitude"),
                          longitude=request.form.get("distrik_longitude"))
        db.session.add(distrik)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Distrik baru berhasil ditambahkan"
        }, "data": distrik.serialize()}, 200
    data = Distrik.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/distrik/<id>", methods=["GET", "POST", "DELETE"])
def distrikbyid(id):
    data = Distrik.query.get(id)
    if request.method == 'POST':
        data.nama = request.form.get("distrik_nama")
        data.latitude = request.form.get("distrik_latitude")
        data.longitude = request.form.get("distrik_longitude")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data Distrik berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data Distrik berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data Distrik tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/rute", methods=["GET", "POST"])
def rute():
    if request.method == 'POST':
        data = Rute(id_asal=request.form.get("id_asal"),
                    id_tujuan=request.form.get("id_tujuan"),
                    jarak=request.form.get("jarak"),
                    path=request.form.get("path"))
        db.session.add(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Rute baru berhasil ditambahkan"
        }, "data": data.serialize()}, 200
    data = Rute.query.all()
    return {"data": [k.serialize() for k in data]}, 200


@api.route("/rute/<id>", methods=["GET", "POST", "DELETE"])
def rutebyid(id):
    data = Rute.query.get(id)
    if request.method == 'POST':
        data.id_asal = request.form.get("id_asal")
        data.id_tujuan = request.form.get("id_tujuan")
        data.jarak = request.form.get("jarak")
        data.path = request.form.get("path")
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data Rute berhasil disimpan"
        }, "data": data.serialize()}, 200
    if request.method == 'DELETE':
        db.session.delete(data)
        db.session.commit()
        return {"toast": {
            "icon": "success",
            "title": "Data Rute berhasil dihapus"
        }}, 200
    if data == None:
        return {"toast": {
            "icon": "error",
            "title": "Data Rute tidak ditemukan"
        }}, 404
    return {"data": data.serialize()}, 200


@api.route("/implementasi", methods=["POST"])
def implementasi():
    req = request.get_json()
    aco = AntColonyOptimization(
        routes_matrix=np.array(req.get("matrix")), ants=req.get("ants"), iteration=req.get("iteration"), evaporation_rate=req.get(
            "evaporation"), alpha=req.get("alpha"), beta=req.get("beta"),
    )
    aco.run()
    return {"routes": (aco.routes-1).tolist(), "distances": aco.distances.tolist(), "best_route": (aco.best_route - 1).tolist(), "best_distance": aco.best_distance, "distance_matrix": aco.distance_matrix.tolist(), "best_distance_matrix": aco.best_distance_matrix.tolist()}, 200
