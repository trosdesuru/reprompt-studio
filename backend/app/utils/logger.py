import logging
import json
from datetime import datetime


class StructuredLogger:
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _format(self, level, msg, request=None, extra=None):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "module": self.logger.name,
            "message": msg,
            "correlation_id": (
                getattr(request.state, "correlation_id", "system")
                if request
                else "system"
            ),
        }
        if extra:
            log_data.update(extra)
        return json.dumps(log_data)

    def info(self, msg, request=None, **kwargs):
        self.logger.info(self._format("INFO", msg, request, kwargs))

    def error(self, msg, request=None, **kwargs):
        self.logger.error(self._format("ERROR", msg, request, kwargs))

    def warning(self, msg, request=None, **kwargs):
        self.logger.warning(self._format("WARNING", msg, request, kwargs))


logger = StructuredLogger("reprompt")
