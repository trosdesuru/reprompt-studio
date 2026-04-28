from app.models.user import UserRole

PLAN_QUOTAS = {
    UserRole.VOYAGER: {
        "max_prompts": 50,
        "max_storage_mb": 100,
        "max_directories": 3,
    },
    UserRole.ARTIST: {
        "max_prompts": 5000,
        "max_storage_mb": 5000,
        "max_directories": 100,
    },
    UserRole.ADMIN: {
        "max_prompts": float("inf"),
        "max_storage_mb": float("inf"),
        "max_directories": float("inf"),
    },
}
