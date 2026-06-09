FROM python:3.11-slim

RUN apt-get update && apt-get install -y netcat-openbsd

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ENV PYTHONUNBUFFERED=1

ENV PATH="/app/.venv/bin:$PATH"

WORKDIR /app

COPY pyproject.toml uv.lock .python-version ./

ARG UV_EXTRA_ARGS="--no-dev"

RUN uv sync --frozen $UV_EXTRA_ARGS

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . /app

ENTRYPOINT ["/entrypoint.sh"]

CMD ["gunicorn", "-c", "gunicorn.conf.py", "run:app"]