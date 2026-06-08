from flask import g
from sqlalchemy import event
from sqlalchemy.orm import with_loader_criteria


def init_tenant_filter(db):

    @event.listens_for(db.session, "do_orm_execute")
    def _add_tenant_filter(execute_state):

        if not execute_state.is_select:
            return

        if execute_state.execution_options.get("skip_tenant_filter"):
            return

        tenant_id = getattr(g, "tenant_id", None)

        if not tenant_id:
            return

        from app.models.goals import Goal
        from app.models.product import Product
        from app.models.user import User

        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                User, lambda cls: cls.tenant_id == tenant_id, include_aliases=True
            ),
            with_loader_criteria(
                Product, lambda cls: cls.tenant_id == tenant_id, include_aliases=True
            ),
            with_loader_criteria(
                Goal, lambda cls: cls.tenant_id == tenant_id, include_aliases=True
            ),
        )
