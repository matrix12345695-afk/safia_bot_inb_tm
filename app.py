from fastapi import FastAPI, Request
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


# 🔥 ПРИЁМ ДАННЫХ ОТ БОТА
@app.post("/update_dashboard")
async def update_dashboard(request: Request):

    data = await request.json()

    os.makedirs("data", exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return {"status": "ok"}


@app.get("/")
def index():
    return FileResponse("web/index.html")