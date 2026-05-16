#### Ejecutar comnado de generación de archivo para versionado
docker compose exec backend alembic revision --autogenerate -m "refactor app/api: cleaning code"

### Aplica los cambios a tu base de datos local
docker compose exec backend alembic upgrade head

### Manda todo a GitHub para que Render lo despliegue
git add backend/alembic/versions/
git commit -m "description commit version"
git push origin main

### Confirmación de estructura de BBDD con sello stamp
docker compose exec backend alembic stamp head