from uuid import UUID

from uuid6 import uuid7


class UUIDGenerator:
    @staticmethod
    def generate() -> UUID:
        return uuid7()
