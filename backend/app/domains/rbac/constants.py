DEFAULT_ROLES = {
    "admin": [
        "product:view",
        "product:create",
        "product:update",
        "product:delete",
        "sale:view",
        "sale:create",
        "sale:cancel",
        "user:view",
        "user:create",
        "user:update",
        "user:delete",
    ],
    "manager": [
        "product:view",
        "product:create",
        "product:update",
        "sale:view",
        "sale:create",
    ],
    "seller": [
        "product:view",
        "sale:create",
    ],
    "stock": [
        "product:view",
        "product:update",
    ],
}
