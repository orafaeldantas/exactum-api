from flask import current_app
from flask.cli import with_appcontext

from app.infra.seed.rbac_seed import seed_rbac
from seeds.run_seed import run_seed


def register_cli(app) -> None:

    @app.cli.command("seed")
    @with_appcontext
    def seed() -> None:
        run_seed(app)

    @app.cli.command("seed-rbac")
    @with_appcontext
    def seed_rbac_command() -> None:
        seed_rbac()
        print("RBAC seed executado com sucesso.")

    @app.cli.command("redis-test")
    @with_appcontext
    def redis_test() -> None:

        redis = current_app.extensions["redis"]

        redis.set("ping", "pong")

        result = redis.get("ping")

        print(f"Redis respondeu: {result}")
