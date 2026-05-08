from __future__ import annotations

import json
import os
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
STATE_PATH = DATA_DIR / "melonia_state.json"
CONFIG_PATH = DATA_DIR / "server_config.json"

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}

DEFAULT_STATE = {
    "site": {
        "name": "The Empire of Melonia",
        "motto": "FOR THE EMPEROR",
        "founded": "24 November 2024",
        "capital": "Melonia Main",
        "flag": "melonia.png",
        "territories": [
            {
                "key": "meloniaMain",
                "name": "Melonia Main",
                "summary": {
                    "en": "The principal seat of the Empire and the ceremonial center of national administration.",
                    "nl": "De hoofdzetel van het Keizerrijk en het ceremoniële centrum van het nationale bestuur.",
                    "no": "Keizerdømmets hovedsete og det seremonielle sentrum for den nasjonale administrasjonen.",
                    "it": "La sede principale dell'Impero e il centro cerimoniale dell'amministrazione nazionale.",
                },
            },
            {
                "key": "meloniaSouth",
                "name": "Melonia South",
                "summary": {
                    "en": "A southern territorial division represented within the wider empire structure.",
                    "nl": "Een zuidelijke territoriale afdeling die vertegenwoordigd is binnen de bredere keizerrijksstructuur.",
                    "no": "En sørlig territoriell inndeling representert i den bredere keizerdømmestrukturen.",
                    "it": "Una divisione territoriale meridionale rappresentata all'interno della più ampia struttura dell'impero.",
                },
            },
            {
                "key": "meloniaNorth",
                "name": "Melonia North",
                "summary": {
                    "en": "A northern territorial division forming part of the national framework of Melonia.",
                    "nl": "Een noordelijke territoriale afdeling die deel uitmaakt van het nationale kader van Melonia.",
                    "no": "En nordlig territoriell inndeling som utgjør en del av Melonias nasjonale rammeverk.",
                    "it": "Una divisione territoriale settentrionale che fa parte del quadro nazionale di Melonia.",
                },
            },
        ],
        "ministries": [
            {
                "name": "Royal Household",
                "title": "Royal Household and Court Affairs",
                "description": "Maintains the ceremonial dignity, royal schedule, court protocol, and official household administration of the Crown.",
                "minister": "To be appointed",
                "focus": "Ceremony, royal protocol, and state presentation.",
            },
            {
                "name": "Council Affairs",
                "title": "Council Affairs",
                "description": "Coordinates council procedure, official resolutions, ministerial continuity, and constitutional administration.",
                "minister": "To be appointed",
                "focus": "Council administration and institutional continuity.",
            },
            {
                "name": "Foreign Affairs",
                "title": "Foreign Affairs and Diplomatic Relations",
                "description": "Oversees diplomatic correspondence, declarations, recognition matters, and official external communication.",
                "minister": "To be appointed",
                "focus": "Diplomacy, public relations, and state correspondence.",
            },
            {
                "name": "Internal Affairs",
                "title": "Internal Affairs",
                "description": "Responsible for internal administration, territorial coordination, registry oversight, and domestic governance.",
                "minister": "To be appointed",
                "focus": "Internal order and territorial administration.",
            },
            {
                "name": "Citizenship and Civil Register",
                "title": "Citizenship and Civil Register",
                "description": "Maintains citizenship applications, civil entries, population records, and administrative verification workflows.",
                "minister": "To be appointed",
                "focus": "Citizenship status and public civil records.",
            },
            {
                "name": "Passports and National Documentation",
                "title": "Passports and National Documentation",
                "description": "Handles public passport requests, document formats, issuance review, and identity documentation standards.",
                "minister": "To be appointed",
                "focus": "Official documents, passports, and identity materials.",
            },
            {
                "name": "Culture and Ceremony",
                "title": "Culture and Ceremony",
                "description": "Preserves national symbolism, public traditions, ceremonial texts, and cultural representation of Melonia.",
                "minister": "To be appointed",
                "focus": "National identity, tradition, and ceremonial life.",
            },
            {
                "name": "Territorial Administration",
                "title": "Territorial Administration",
                "description": "Supports structured administration across Melonia Main, Melonia South, and Melonia North.",
                "minister": "To be appointed",
                "focus": "Territorial order and coordination between seats of the Kingdom.",
            },
        ],
        "news": [
            {
                "id": "news-1",
                "title": "Official Public Portal Established",
                "date": "2026-05-08",
                "summary": "The Royal Kingdom of Melonia presents its official public website, including civic register forms and institutional information.",
            }
        ],
        "allies": [
            {
                "id": "ally-1",
                "name": "Allied State Placeholder",
                "status": "Open for future diplomatic confirmation",
                "notes": "This section can be updated through the dev portal when official allied relationships are announced.",
            }
        ],
    },
    "applications": {
        "citizens": [],
        "passports": [],
    },
}

DEFAULT_SERVER_CONFIG = {
    "host": "127.0.0.1",
    "port": 8000,
    "admin_username": "admin",
    "admin_password": "melonia-dev",
}

TOKENS: dict[str, str] = {}


def ensure_files() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_PATH.exists():
        STATE_PATH.write_text(json.dumps(DEFAULT_STATE, indent=2, ensure_ascii=False), encoding="utf-8")
    if not CONFIG_PATH.exists():
        CONFIG_PATH.write_text(json.dumps(DEFAULT_SERVER_CONFIG, indent=2, ensure_ascii=False), encoding="utf-8")


def load_state() -> dict:
    ensure_files()
    return json.loads(STATE_PATH.read_text(encoding="utf-8"))


def save_state(state: dict) -> None:
    STATE_PATH.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")


def load_server_config() -> dict:
    ensure_files()
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def json_response(handler: BaseHTTPRequestHandler, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
    encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(encoded)))
    handler.end_headers()
    handler.wfile.write(encoded)


def read_json_body(handler: BaseHTTPRequestHandler) -> dict:
    length = int(handler.headers.get("Content-Length", "0"))
    raw = handler.rfile.read(length) if length else b"{}"
    return json.loads(raw.decode("utf-8"))


def public_payload(state: dict) -> dict:
    return state["site"]


def dev_payload(state: dict) -> dict:
    return {
        "site": state["site"],
        "applications": state["applications"],
    }


class MeloniaHandler(BaseHTTPRequestHandler):
    server_version = "MeloniaServer/1.0"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/public":
            state = load_state()
            return json_response(self, public_payload(state))
        return self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/dev/login":
            body = read_json_body(self)
            config = load_server_config()
            if body.get("username") == config["admin_username"] and body.get("password") == config["admin_password"]:
                token = secrets.token_hex(24)
                TOKENS[token] = body["username"]
                return json_response(self, {"token": token})
            return json_response(self, {"error": "Invalid credentials"}, HTTPStatus.UNAUTHORIZED)

        if parsed.path == "/api/citizen-applications":
            body = read_json_body(self)
            state = load_state()
            entry = {
                "id": f"citizen-{secrets.token_hex(6)}",
                "fullName": body.get("fullName", "").strip(),
                "birthDate": body.get("birthDate", "").strip(),
                "residence": body.get("residence", "").strip(),
                "territory": body.get("territory", "").strip(),
                "notes": body.get("notes", "").strip(),
                "submittedAt": iso_now(),
            }
            state["applications"]["citizens"].insert(0, entry)
            save_state(state)
            return json_response(self, {"ok": True, "entry": entry}, HTTPStatus.CREATED)

        if parsed.path == "/api/passport-applications":
            body = read_json_body(self)
            state = load_state()
            entry = {
                "id": f"passport-{secrets.token_hex(6)}",
                "applicantName": body.get("applicantName", "").strip(),
                "documentType": body.get("documentType", "").strip(),
                "territory": body.get("territory", "").strip(),
                "issueReason": body.get("issueReason", "").strip(),
                "submittedAt": iso_now(),
            }
            state["applications"]["passports"].insert(0, entry)
            save_state(state)
            return json_response(self, {"ok": True, "entry": entry}, HTTPStatus.CREATED)

        json_response(self, {"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def serve_static(self, path: str) -> None:
        relative = path.lstrip("/") or "index.html"
        file_path = (ROOT / relative).resolve()
        if ROOT not in file_path.parents and file_path != ROOT / "index.html":
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if not file_path.exists() or not file_path.is_file():
            file_path = ROOT / "index.html"
        suffix = file_path.suffix.lower()
        content_type = MIME_TYPES.get(suffix, "application/octet-stream")
        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args) -> None:
        return


def run() -> None:
    config = load_server_config()
    server = ThreadingHTTPServer((config["host"], int(config["port"])), MeloniaHandler)
    print(f"Melonia server running at http://{config['host']}:{config['port']}")
    server.serve_forever()


if __name__ == "__main__":
    config = load_server_config()

    host = "0.0.0.0"
    port = int(os.environ.get("PORT", config["port"]))

    server = ThreadingHTTPServer((host, port), MeloniaHandler)

    print(f"Melonia server running at http://{host}:{port}")

    server.serve_forever()