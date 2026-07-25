from marshmallow import Schema, fields
from marshmallow.validate import Length


class ResponseRBACSchema(Schema):
    uuid = fields.UUID()

    name = fields.Str()


class PermissionSchema(Schema):
    code = fields.Str(required=True)


class ResponseRoleWithPermissions(ResponseRBACSchema):
    """
    fields.Pluck(nested_schema, target_field, many=False)

    Purpose:
        Simplify the output payload (dump) by extracting the value of a specific
        field from a nested object, eliminating the need to return a full dictionary.

    Usage Example (Permissions):
        - Input (Python):    [{"id": 1, "code": "product:view", "description": "..."}]
        - Output (JSON API): ["product:view"]

    Parameters used:
        - nested_schema: The original Schema containing
          the object structure (PermissionSchema).
        - target_field: The string representing the exact
          name of the field to extract ("code").
        - many=True: Indicates that the field handles a
          collection/list of these elements.
    """

    permissions = fields.Pluck(PermissionSchema, "code", many=True)


class UpdateRole(Schema):
    name = fields.Str(allow_none=False, validate=Length(min=1))

    permissions = fields.List(fields.Str(), attribute="new_permissions")


class CreateRole(Schema):
    name = fields.Str(required=True, allow_none=False, validate=Length(min=1))

    permissions = fields.List(fields.Str(), required=True)
