from flask_smorest import Blueprint

from app.core.monitoring.health_schema import HealthResponseSchema
from app.core.monitoring.health_service import HealthService

blp_health = Blueprint(
    "health",
    __name__,
    url_prefix="/health",
    description="Health Check",
)


@blp_health.get("/")
@blp_health.response(200, HealthResponseSchema)
@blp_health.response(503, HealthResponseSchema)
def health() -> tuple[dict, int]:

    health_data = HealthService.check_services()

    return health_data, health_data["http_status"]
