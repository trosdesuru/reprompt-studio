from sqlmodel import Session, select
from datetime import datetime, timezone

from app.models.user import AuditLog
from app.models.gallery import GalleryMetric


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

    @staticmethod
    def log_gallery_interaction(
        session: Session, url: str, title: str, thumb: str, interaction_type: str
    ):
        """interaction_type puede ser 'view' o 'download'"""
        try:
            # Buscamos si la galería ya existe en nuestra base de datos
            metric = session.exec(
                select(GalleryMetric).where(GalleryMetric.url == url)
            ).first()

            if not metric:
                # Si no existe, la registramos por primera vez
                metric = GalleryMetric(url=url, title=title, thumb=thumb)
                session.add(metric)

            # Sumamos la métrica
            if interaction_type == "view":
                metric.views += 1
            elif interaction_type == "download":
                metric.downloads += 1

            metric.last_accessed = datetime.now(timezone.utc)

            session.add(metric)
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"⚠️ Error al actualizar métricas de galería: {e}")
