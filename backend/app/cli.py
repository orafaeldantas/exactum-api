from flask import current_app

from seeds.run_seed import run_seed


def register_cli(app):

    @app.cli.command("seed")
    def seed():
        run_seed(app)

    @app.cli.command("redis-test")
    def redis_test():

        redis = current_app.extensions["redis"]

        redis.set("ping", "pong")

        print(redis.get("ping"))
