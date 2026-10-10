# Shhhh
A free portfolio study demo: upload a text-based PDF, find relevant excerpts with page references, and run a 25-minute focus timer.

## Run locally
Use Python 3.9+ and a Node version supported by the installed Vite release.

```sh
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt
backend/venv/bin/uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --workers 1 --no-access-log
```

In another terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite URL. `/api` is proxied to the backend during development. Production hosting must serve frontend assets and proxy `/api/*` to the backend with the prefix removed. Use one backend worker: document sessions are in memory and are not shared between workers. Vite preview alone does not provide the API.

## Checks

```sh
cd frontend
npm run build
npm run lint
```

From the repository root:

```sh
backend/venv/bin/python -m unittest discover -s backend/tests -v
```

## Behaviour and resource limits
No local language models, embeddings, GPU acceleration, external AI calls, analytics, cookies or browser persistence. PDF parsing runs on the server; the browser uses a one-second interval only while the timer runs. Search is keyword retrieval, not generated answers. The timer uses a deadline so background-tab throttling does not accumulate drift.

PDF limit: 8 MB, 150 pages and 500,000 extracted characters. At most 20 active document sessions per process, expiring 30 minutes after upload. Expired sessions are inaccessible and removed during subsequent upload/search cleanup or restart. Delete document removes the active session immediately. Reloading drops the browser token; the server session expires normally. No OCR or durable progress is provided.

The active backend is `backend/main.py`. Legacy `backend/ai`, `backend/services` and `backend/routes` files are not imported by it; existing user changes there were preserved.

Read [the audit and launch requirements](AUDIT.md) before public hosting.

## Host the full demo
The Dockerfile builds the frontend and serves both frontend and API from one
Python service. The container copies no uploads, secrets, local database or
legacy AI code. No API key is needed.

```sh
docker build -t shhhh-demo .
docker run --rm -p 8000:8000 --memory=512m --cpus=1 shhhh-demo
```

Open http://localhost:8000. `render.yaml` is a deployment blueprint for a free
Render web service; connect your GitHub repository in Render to deploy it.
Hosting requires your hosting account; pushing to GitHub alone does not deploy
this Python application. Use trusted sample PDFs during evaluation and apply
the public-upload protections described in AUDIT.md before opening uploads to
untrusted visitors. Free hosts may sleep when idle.
