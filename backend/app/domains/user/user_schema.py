from marshmallow import Schema, fields


class BaseUserSchema(Schema):
    id = fields.Int(dump_only=True)

    username = fields.Str(required=True)

    is_active = fields.Bool(required=True)

    role = fields.Str(required=True)

    email = fields.Email(required=True)


class CreateUserSchema(BaseUserSchema):
    password = fields.Str(required=True, load_only=True)


class UserResponseSchema(BaseUserSchema):
    pass


class UpdateUserSchema(Schema):
    username = fields.Str()

    role = fields.Str()

    is_active = fields.Bool()

    email = fields.Email()

    password = fields.Str(load_only=True)

    password_reset = fields.Bool()


class ProfileSchema(Schema):
    email = fields.Email()

    username = fields.Str()

    password = fields.Str(load_only=True)

    confirm_password = fields.Str(data_key="confirmPassword", load_only=True)

    current_password = fields.Str(data_key="currentPassword", load_only=True)


class NewPasswordUserSchema(Schema):
    password = fields.Str(load_only=True, required=True)

    confirm_password = fields.Str(
        data_key="confirmPassword", load_only=True, required=True
    )

    password_reset = fields.Bool(load_only=True, required=True)


class NewPassworUserResponseSchema(Schema):
    pass
