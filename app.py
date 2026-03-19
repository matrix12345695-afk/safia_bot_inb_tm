from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import json
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
WEB_DIR = os.path.join(BASE_DIR, "web")

DATA_FILE = os.path.join(DATA_DIR, "dashboard.json")


# -----------------------
# DASHBOARD GET
# -----------------------
@app.get("/dashboard")
def get_dashboard():
    try:
        if not os.path.exists(DATA_FILE):
            return {"items": []}

        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    except Exception as e:
        print("❌ dashboard read error:", e)
        return {"items": []}


# -----------------------
# DASHBOARD UPDATE
# -----------------------
@app.post("/update_dashboard")
async def update_dashboard(request: Request):
    try:
        data = await request.json()

        os.makedirs(DATA_DIR, exist_ok=True)

        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("📊 Dashboard обновлён")

        return {"status": "ok"}

    except Exception as e:
        print("❌ update error:", e)
        return {"status": "error"}


# -----------------------
# STATIC FILES
# -----------------------
try:
    if os.path.exists(WEB_DIR):
        app.mount("/web", StaticFiles(directory=WEB_DIR), name="web")
except Exception as e:
    print("❌ static mount error:", e)


# -----------------------
# INDEX
# -----------------------
@app.get("/")
def index():
    try:
        index_path = os.path.join(WEB_DIR, "index.html")

        if os.path.exists(index_path):
            return FileResponse(index_path)

        return JSONResponse({"error": "index.html not found"})

    except Exception as e:
        print("❌ index error:", e)
        return {"error": "server error"}
