#!/usr/bin/env python3
"""Servidor local para un chatbot con avatar y voz en español."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import urllib.error
import urllib.request

ROOT = Path(__file__).parent
OLLAMA_URL = "http://127.0.0.1:11434/api/chat"
MODEL = "llama3.2:3b"

class Handler(BaseHTTPRequestHandler):
    def _send(self, status, content_type, body):
        data = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            path = ROOT / "public" / "index.html"
            self._send(200, "text/html; charset=utf-8", path.read_text(encoding="utf-8"))
        elif self.path == "/styles.css":
            path = ROOT / "public" / "styles.css"
            self._send(200, "text/css; charset=utf-8", path.read_text(encoding="utf-8"))
        elif self.path == "/app.js":
            path = ROOT / "public" / "app.js"
            self._send(200, "application/javascript; charset=utf-8", path.read_text(encoding="utf-8"))
        else:
            self._send(404, "text/plain; charset=utf-8", "No encontrado")

    def do_POST(self):
        if self.path != "/api/chat":
            self._send(404, "application/json", '{"error":"No encontrado"}')
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length))
            messages = payload.get("messages", [])[-12:]

            body = json.dumps({
                "model": MODEL,
                "stream": False,
                "messages": [
                    {"role": "system", "content": "Eres un asistente amable que conversa en español. Sé claro, honesto y breve. Habla como un amigo cercano. No finjas ser una persona real ni uses identidad ajena."},
                    *messages,
                ],
            }).encode("utf-8")

            request = urllib.request.Request(
                OLLAMA_URL,
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            with urllib.request.urlopen(request, timeout=90) as response:
                result = json.loads(response.read())

            answer = result.get("message", {}).get("content", "No recibí una respuesta.")
            self._send(200, "application/json; charset=utf-8", json.dumps({"reply": answer, "local_model": True}))

        except (urllib.error.URLError, TimeoutError, ConnectionError):
            self._send(200, "application/json; charset=utf-8", json.dumps({
                "reply": "Estoy funcionando en modo local, pero Ollama no está conectado. Instala Ollama y ejecuta: ollama run llama3.2:3b",
                "local_model": False,
            }))
        except Exception as exc:
            self._send(400, "application/json; charset=utf-8", json.dumps({"error": str(exc)}))

if __name__ == "__main__":
    print("Abre http://127.0.0.1:8000 en tu navegador")
    ThreadingHTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
