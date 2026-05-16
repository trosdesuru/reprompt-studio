from typing import Any, Dict

NOT_FOUND_RESPONSE: Dict[int, Dict[str, Any]] = {
    404: {"description": "El recurso solicitado no existe en la base de datos."}
}

SERVER_ERROR_RESPONSE: Dict[int, Dict[str, Any]] = {
    500: {"description": "Error interno del servidor."}
}

AUTH_RESPONSE: Dict[int, Dict[str, Any]] = {
    401: {"description": "No autenticado."},
}

FORBIDDEN_RESPONSE: Dict[int, Dict[str, Any]] = {
    403: {"description": "Permiso no autorizado"}
}

RATE_LIMIT_RESPONSE: Dict[int, Dict[str, Any]] = {
    429: {"description": "Demasiadas peticiones. Cuenta bloqueada temporalmente."}
}
