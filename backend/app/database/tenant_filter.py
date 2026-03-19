from sqlalchemy import event
from sqlalchemy.orm import with_loader_criteria
from flask import g

def init_tenant_filter(db):

    @event.listens_for(db.session, "do_orm_execute")
    def _add_tenant_filter(execute_state):

        if not execute_state.is_select:
            return

        tenant_id = getattr(g, "tenant_id", None)

        if not tenant_id:
            return

        from app.models import User, Product

        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                User,
                lambda cls: cls.tenant_id == tenant_id,
                include_aliases=True
            ),
            with_loader_criteria(
                Product,
                lambda cls: cls.tenant_id == tenant_id,
                include_aliases=True
            )
        )