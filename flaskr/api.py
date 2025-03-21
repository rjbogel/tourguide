from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify, Response
from . import db
from .models import User
from flask_login import login_user, logout_user, login_required, current_user
import numpy as np

import pickle
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
import json
import random
import string
import pandas as pd

api = Blueprint("api", __name__)
with open("dataset/data.json") as guci_dataset:
  dataset = json.load(guci_dataset)


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
            }, "login": True, "redirect": url_for('views.dashboard')}, 200
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


@api.route("/lokasi", methods=["GET"])
def lokasi():
    data = pd.read_csv("dataset/lokasi.csv", delimiter=";")
    return Response(data.to_json(orient="records"), mimetype='application/json')

def processing_json_dataset(dataset):
  tags = []
  inputs = []
  responses={}
  for intent in dataset['intents']:
    responses[intent['intent']]=intent['responses']
    for lines in intent['text']:
      inputs.append(lines)
      tags.append(intent['intent'])
  return [tags, inputs, responses]

@api.route("/chatting", methods=["POST"])
def chatting():
    req = request.get_json()
    query = req.get("query")
    print(query)
    texts = []

    pred_input = query
    pred_input = [letters.lower() for letters in pred_input if letters not in string.punctuation]
    pred_input = ''.join(pred_input)
    texts.append(pred_input)
    with open('output/tokenizer.pickle', 'rb') as handle:
        tokenizer = pickle.load(handle)
    pred_input = tokenizer.texts_to_sequences(texts)
    pred_input = np.array(pred_input).reshape(-1)
    pred_input = pad_sequences([pred_input],8)
    m = tf.keras.models.load_model('output/guci.keras')
    output = m.predict(pred_input)
    output = output.argmax()

    le = LabelEncoder()
    le.classes_ = np.load('output/classes.npy', allow_pickle=True)
    le.classes_

    response_tag = le.inverse_transform([output])[0]

    responses = [item for item in dataset if item["label"] == response_tag][0]

    return {"answer": responses["jawaban"]}, 200
