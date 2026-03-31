# ==========================================
# 🐳 DOCKER: ORQUESTACIÓN Y RESETEOS
# ==========================================
.PHONY: docker-up docker-fast docker-reset docker-nuke

docker-up:
	@echo "🚀 Levantando contenedores (Build normal)..."
	docker-compose up -d --build

docker-fast:
	@echo "⚡ RESETEO RÁPIDO: Reiniciando servicios sin reconstruir..."
	docker-compose restart

docker-reset:
	@echo "🔄 Reiniciando el frontend limpiamente..."
	docker-compose stop frontend
	docker-compose rm -f frontend
	docker-compose build --no-cache frontend
	docker-compose up -d frontend

docker-nuke:
	@echo "💣 DESTRUCCIÓN TOTAL: Borrando contenedores, volúmenes, redes e imágenes huérfanas..."
	docker-compose down -v --remove-orphans --rmi local
	@echo "🏗️ Reconstruyendo desde cero absoluto..."
	docker-compose build --no-cache
	docker-compose up -d

# ==========================================
# 📦 REPOMIX: EXTRACCIÓN DE PROYECTO
# ==========================================
.PHONY: repo-front repo-back repo-all

repo-front:
	@echo "🧠 Extrayendo código del Frontend..."
	npx repomix frontend -o repomix-frontend.xml

repo-back:
	@echo "🧠 Extrayendo código del Backend..."
	npx repomix backend -o repomix-backend.xml

repo-all:
	@echo "🧠 Extrayendo TODO el proyecto..."
	npx repomix . -o repomix-full.xml

# ==========================================
# ⚙️ MANTENIMIENTO E INSTALACIONES
# ==========================================
.PHONY: install-front

install-front:
	@echo "📦 Instalando dependencias del frontend limpiamente..."
	cd frontend && rm -rf node_modules package-lock.json && npm install

# ==========================================
# 🐙 GIT: AUTOMATIZACIÓN DE CONTROL DE VERSIONES
# ==========================================
.PHONY: git-auto

git-auto:
	@echo "🔍 Analizando estado del repositorio..."
	git status -s
	@echo "📦 Añadiendo cambios al Stage..."
	git add .
	@echo "📝 Generando commit dinámico..."
	@FILES=$$(git diff --cached --name-only | tr '\n' ', ' | sed 's/, $$//'); \
	if [ -z "$$FILES" ]; then \
		echo "⚠️ No hay cambios para commitear."; \
	else \
		BRANCH=$$(git rev-parse --abbrev-ref HEAD); \
		echo "🚀 Commiteando en la rama: $$BRANCH"; \
		git commit -m "auto-refactor: actualiza $$FILES"; \
		echo "☁️ Subiendo a origin/$$BRANCH..."; \
		git push origin $$BRANCH; \
		echo "✅ ¡Sincronización completada con éxito!"; \
	fi
