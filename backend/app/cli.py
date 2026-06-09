from seeds.run_seed import run_seed


def register_cli(app):

    @app.cli.command("seed")
    def seed():
        run_seed(app)
