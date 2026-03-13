import json
import os
from datetime import datetime

import requests
from flask import Flask, redirect, render_template, request


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")


def load_api_base_url():
    env_url = os.getenv("API_BASE_URL", "").strip().rstrip("/")
    if env_url:
        return env_url

    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            cfg = json.load(f)
            cfg_url = str(cfg.get("API_URL", "")).strip().rstrip("/")
            if cfg_url:
                return cfg_url
    except Exception:
        pass

    return "https://chelsea-partner-sleeping-advancement.trycloudflare.com"


API_BASE_URL = load_api_base_url()
app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)


def fetch_api_json(path, params=None):
    try:
        response = requests.get(f"{API_BASE_URL}{path}", params=params, timeout=12)
        response.raise_for_status()
        return response.json(), None
    except Exception as exc:
        return None, str(exc)


@app.context_processor
def inject_globals():
    return {"now": datetime.now, "api_base_url": API_BASE_URL}


@app.route("/")
def home():
    payload, err = fetch_api_json("/dashboard-data")
    if payload and payload.get("success"):
        return render_template(
            "index.html",
            employees=payload.get("employees", []),
            today_attendance_count=payload.get("today_attendance_count", 0),
            working_now_count=payload.get("working_now_count", 0),
            absent_count=payload.get("absent_count", 0),
            api_unavailable=False,
            api_error="",
        )
    return render_template(
        "index.html",
        employees=[],
        today_attendance_count=0,
        working_now_count=0,
        absent_count=0,
        api_unavailable=True,
        api_error=err or "Unable to connect to API",
    )


@app.route("/dashboard")
def dashboard():
    return redirect("/")


@app.route("/mark")
def mark():
    return render_template("mark.html", api_unavailable=False, api_error="")


@app.route("/register")
def register():
    return render_template("register.html", api_unavailable=False, api_error="")


@app.route("/update-employee-photo/")
@app.route("/update-employee-photo/<int:emp_code>")
def update_page(emp_code=None):
    return render_template(
        "UpdateEmployee.html",
        emp_code=emp_code,
        api_unavailable=False,
        api_error="",
    )


@app.route("/report")
def report():
    params = {
        "from_date": request.args.get("from_date"),
        "to_date": request.args.get("to_date"),
        "employee_id": request.args.get("employee_id"),
    }
    payload, err = fetch_api_json("/report-data", params=params)
    if payload and payload.get("success"):
        records = payload.get("data", [])
        for rec in records:
            ts = rec.get("timestamp")
            if ts:
                try:
                    rec["timestamp"] = datetime.fromisoformat(ts)
                except Exception:
                    rec["timestamp"] = None
        return render_template(
            "report.html",
            data=records,
            employees=payload.get("employees", []),
            total_minutes=payload.get("total_minutes", 0),
            from_date=payload.get("from_date"),
            to_date=payload.get("to_date"),
            selected_employee=payload.get("selected_employee", ""),
            api_unavailable=False,
            api_error="",
        )
    return render_template(
        "report.html",
        data=[],
        employees=[],
        total_minutes=0,
        from_date=request.args.get("from_date"),
        to_date=request.args.get("to_date"),
        selected_employee=request.args.get("employee_id", ""),
        api_unavailable=True,
        api_error=err or "Unable to connect to API",
    )


if __name__ == "__main__":
    ui_host = os.getenv("UI_HOST", "127.0.0.1")
    ui_port = int(os.getenv("UI_PORT", "5050"))
    app.run(host=ui_host, port=ui_port, debug=True)

