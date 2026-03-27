from sqlmodel import Session
from app.models.user import AuditLog


class AuditService:
    @staticmethod
    def log_action(session: Session, username: str, action: str, details: str):
        """Registra una acción en el AuditLog de forma silenciosa."""
        try:
            log = AuditLog(username=username, action=action, details=details)
            session.add(log)
            session.commit()
        except Exception as e:
            # Nunca rompemos la app por un fallo en el log
            session.rollback()
            print(f"⚠️ Error al registrar auditoría: {e}")
