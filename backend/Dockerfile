FROM python:3.11-slim

RUN apt-get update && apt-get install -y netcat-openbsd

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . /app

ENTRYPOINT ["/entrypoint.sh"]
CMD ["flask", "run", "--no-reload"]