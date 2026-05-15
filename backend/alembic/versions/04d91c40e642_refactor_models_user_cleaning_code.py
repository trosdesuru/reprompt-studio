"""refactor models/user: cleaning code

Revision ID: 04d91c40e642
Revises: ff680994dd8e
Create Date: 2026-05-15 20:09:56.563056

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = "04d91c40e642"
down_revision: Union[str, Sequence[str], None] = "ff680994dd8e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 0. DESTRUIR el molde viejo/fallido que se quedó atascado en PostgreSQL
    op.execute("DROP TYPE IF EXISTS userrole CASCADE")

    # 1. Crear el ENUM nuevo y limpio con los valores exactos en MINÚSCULAS
    userrole_enum = sa.Enum("voyager", "artist", "admin", name="userrole")
    userrole_enum.create(op.get_bind(), checkfirst=False)

    # 2. Modificar la columna
    op.alter_column(
        "user",
        "role",
        existing_type=sa.VARCHAR(),
        type_=userrole_enum,
        existing_nullable=False,
        postgresql_using="role::userrole",
    )


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Revertir la columna a VARCHAR
    op.alter_column(
        "user",
        "role",
        existing_type=sa.Enum("voyager", "artist", "admin", name="userrole"),
        type_=sa.VARCHAR(),
        existing_nullable=False,
        postgresql_using="role::varchar",
    )

    # 2. Eliminar el tipo ENUM de la base de datos
    userrole_enum = sa.Enum("voyager", "artist", "admin", name="userrole")
    userrole_enum.drop(op.get_bind(), checkfirst=True)
