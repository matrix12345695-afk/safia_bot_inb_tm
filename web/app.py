from fastapi import FastAPI
from fastapi.responses import FileResponse
import json
import os

app = FastAPI()

DATA_FILE = "data/dashboard.json"


@app.get("/dashboard")
def get_dashboard():

    if not os.path.exists(DATA_FILE):
        return {"items": []}

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/")
def index():
    return FileResponse("index.html")
