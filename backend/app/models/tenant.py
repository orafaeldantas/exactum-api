from app.extensions import db
from datetime import datetime, timezone

class Tenant(db.Model):
    __tablename__ = "tenants"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    fantasy_name = db.Column(db.String(120), nullable=True)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    plan = db.Column(db.String(100), nullable=False)
    cnpj = db.Column(db.String(18), unique=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    users = db.relationship("User", backref="tenant")