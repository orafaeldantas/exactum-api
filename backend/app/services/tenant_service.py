import re
from app.extensions import db
from app.models import Tenant, User, Goal
from flask import g

import logging

logger = logging.getLogger(__name__)

def create_tenant(data):
    try:

        company = data.get("company", {})
        admin = data.get("admin", {})
        plan = data.get("plan", {})

        # Clean the cnpj to retrieve only the numbers
        raw_cnpj = company.get("cnpj", "")
        clean_cnpj = re.sub(r'\D', '', raw_cnpj)

        if (admin.get("password") != admin.get("confirmPassword")):
            return 'the password confirmation is incorrect.'

        tenant = Tenant(
            name=company.get("name"),
            fantasy_name=company.get("fantasyName"),
            cnpj=clean_cnpj,
            plan=plan.get("type"),
            slug=company.get("slug")
        )

        db.session.add(tenant)
        db.session.flush() # Generates the tenant.id


        user = User(
            username=f"{admin.get('firstName')} {admin.get('lastName')}",
            email=admin.get("email"),
            tenant_id=tenant.id, 
            is_active=True,
            role="admin"
        )

        user.set_password(admin.get("password"))
        db.session.add(user)
        
        db.session.commit()
        return 'tenant created successfully!'

    except Exception as e:
        db.session.rollback()
        logger.error(e)
        return 'error while trying to create the tenant.'
    
def list_tenants():
    return Tenant.query.all()

def get_tenant_by_id():
    return Tenant.query.filter_by(id=g.tenant_id).first()

def update_tenant_by_id(data):
    
    tenant = get_tenant_by_id()
    
    if "companyName" in data: tenant.name = data.get("companyName")
    if "companyEmail" in data: tenant.corporate_email = data.get("companyEmail")
    if "minimumStock" in data: tenant.global_min_stock = data.get("minimumStock")

    db.session.commit() 
    
def get_goal():
    return Goal.query.filter_by(tenant_id=g.tenant_id).order_by(Goal.id.desc()).first()

def create_goal(data):

    if "monthlyGoal" in data:
        goal = Goal(
                tenant_id=g.tenant_id,
                type="monthly",
                year=9999,
                month=9999,
                value=data.get("monthlyGoal"),
                description="monthly"
            )

        db.session.add(goal)
        db.session.commit()
