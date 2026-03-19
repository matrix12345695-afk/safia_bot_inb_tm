from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import json
import os

app = FastAPI()

# 📌 БАЗОВАЯ ПАПКА ПРОЕКТА (ВАЖНО ДЛЯ RENDER)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(BASE_DIR, "data", "dashboard.json")


# 📊 ПОЛУЧЕНИЕ DASHBOARD
@app.get("/dashboard")
def get_dashboard():

    if not os.path.exists(DATA_FILE):
        return {"items": []}

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"items": []}


# 🔥 ПРИЁМ ДАННЫХ ОТ БОТА
@app.post("/update_dashboard")
async def update_dashboard(request: Request):

    data = await request.json()

    os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("📊 Dashboard обновлён (Render)")

    return {"status": "ok"}


# 🌐 СТАТИКА (JS / CSS)
app.mount(
    "/web",
    StaticFiles(directory=os.path.join(BASE_DIR, "web")),
    name="web"
)


# 🖥 ГЛАВНАЯ СТРАНИЦА
@app.get("/")
def index():
    return FileResponse(os.path.join(BASE_DIR, "web", "index.html"))
