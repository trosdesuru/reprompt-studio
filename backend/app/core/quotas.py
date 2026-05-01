from app.models.user import UserRole

PLAN_QUOTAS = {
    UserRole.VOYAGER: {
        "max_prompts_lifetime_bonus": 30,
        "monthly_refill": 5,
        "max_storage_mb": 100,
        "max_file_size_mb": 5,
        "max_directories": 3,
    },
    UserRole.ARTIST: {
        "max_prompts_lifetime_bonus": float("inf"),
        "monthly_refill": float("inf"),
        "max_storage_mb": 5000,
        "max_file_size_mb": 20,
        "max_directories": 100,
    },
    UserRole.ADMIN: {
        "max_prompts_lifetime_bonus": float("inf"),
        "monthly_refill": float("inf"),
        "max_storage_mb": float("inf"),
        "max_file_size_mb": float("inf"),
        "max_directories": float("inf"),
    },
}
