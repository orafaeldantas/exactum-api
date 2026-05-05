from datetime import datetime, timezone
from app.extensions import db


class Sale(db.Model):
    __tablename__ = 'sales'

    id = db.Column(db.Integer, primary_key=True)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    quantity_items = db.Column(db.Integer, nullable=False, default=1)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    items = db.relationship('ItemSale', backref='sale', lazy=True)


class ItemSale(db.Model):
    __tablename__ = 'items_sales'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    sku = db.Column(db.String(50), db.ForeignKey('products.sku'), nullable=False)
    item_price = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)