"""alter_prompts_to_text

Revision ID: a2a6ff880520
Revises: 514a7431e1f7
Create Date: 2026-04-28 18:24:50.118012

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'a2a6ff880520'
down_revision: Union[str, Sequence[str], None] = '514a7431e1f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 🟢 Forzamos a PostgreSQL a cambiar las columnas a TEXT ilimitado
    op.alter_column('imageprompt', 'prompt', type_=sa.Text())
    op.alter_column('imageprompt', 'negative_prompt', type_=sa.Text())


def downgrade() -> None:
    """Downgrade schema."""
    # 🔴 Si hacemos rollback, devolvemos a VARCHAR(255) (El límite antiguo)
    op.alter_column('imageprompt', 'prompt', type_=sa.String(length=255))
    op.alter_column('imageprompt', 'negative_prompt', type_=sa.String(length=255))