import re
from app.extensions import db
from app.models import Tenant, User

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
        return 'ok'

    except Exception as e:
        db.session.rollback()
        logger.error(e)
        return 'err!'
