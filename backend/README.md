# backend/README.md
# ElderCare Assist AI Auth Service

## Quickstart
- Copy .env.example to .env and edit
- `pip install -r requirements.txt`
- `alembic upgrade head`
- `uvicorn app.main:app --reload`

## Tests
`pytest`

## Lint
`ruff check . && black .`

## Deploy to Render
- Use Python environment
- Build: pip install -r requirements.txt && alembic upgrade head
- Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT