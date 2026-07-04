import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def setup_request_logger():

    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    handler = RotatingFileHandler(
        filename=log_dir / "infra.log",
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )

    formatter = logging.Formatter("%(message)s")

    handler.setFormatter(formatter)

    logger = logging.getLogger("infra")

    logger.setLevel(logging.INFO)

    if not logger.handlers:
        logger.addHandler(handler)

    return logger
