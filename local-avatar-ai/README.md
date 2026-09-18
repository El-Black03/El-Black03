# IA local con avatar y voz

Esta es una aplicación privada para conversar con un avatar en español. Funciona en tu propio equipo y no necesita una cuenta ni una API key.

## Requisitos

- Python 3
- Un navegador moderno

## Iniciar la app local

```bash
cd local-avatar-ai
python server.py
```

Luego abre esta URL en tu navegador:

```text
http://127.0.0.1:8000
```

## Activar IA real local con Ollama (recomendado)

Instala Ollama y descarga un modelo:

```bash
ollama run llama3.2:3b
```

Luego deja Ollama ejecutándose y recarga la página. El servidor intenta conectar con `http://127.0.0.1:11434/api/chat`.

Si Ollama no está activo, la app seguirá funcionando en modo aviso de prueba, pero no responderá con modelo real.

## Privacidad

- El servidor escucha solo en `127.0.0.1`.
- El avatar es un diseño original, no es una copia exacta de una persona real.
- Si quieres usar una foto o voz real, pide permiso antes.
- La voz y el micrófono dependen del navegador.
