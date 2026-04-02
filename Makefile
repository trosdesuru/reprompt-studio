# ==========================================
# 🐳 DOCKER: ORQUESTACIÓN Y RESETEOS
# ==========================================
.PHONY: up build stop down restart reset nuke

up:
	@echo "🚀 Levantando contenedores (Build normal)..."
	docker-compose up

build:
	@echo "🔨 Construyendo contenedores sin cache..."
	docker-compose build --no-cache

stop:
	@echo "⏸️  Pausando contenedores (Sin borrarlos)..."
	docker-compose stop

down:
	@echo "🛑 Deteniendo y eliminando contenedores de la red..."
	docker-compose down

restart:
	@echo "⚡ RESETEO RÁPIDO: Reiniciando servicios sin reconstruir..."
	docker-compose restart

reset:
	@echo "🔄 Reiniciando el frontend limpiamente..."
	docker-compose stop frontend
	docker-compose rm -f frontend
	docker-compose build --no-cache frontend
	docker-compose up -d frontend

nuke:
	@echo "💣 DESTRUCCIÓN TOTAL: Borrando contenedores, volúmenes, redes e imágenes huérfanas..."
	docker-compose down -v --remove-orphans --rmi local
	@echo "🏗️ Reconstruyendo desde cero absoluto..."
	docker-compose build --no-cache
	docker-compose up -d

# ==========================================
# 📊 LOGS Y MONITOREO
# ==========================================
.PHONY: log-back log-front log-back-30 log-front-30 stats mem-check clean-docker

log-back:
	@echo "📜 Mostrando logs del Backend en vivo..."
	docker-compose logs -f backend

log-front:
	@echo "📜 Mostrando logs del Frontend en vivo..."
	docker-compose logs -f frontend

log-back-30:
	@echo "📜 Mostrando los últimos 30 logs del Backend..."b
	docker-compose logs --tail=30 -f backend

log-front-30:
	@echo "📜 Mostrando los últimos 30 logs del Frontend..."
	docker-compose logs --tail=30 -f frontend

stats:
	@echo "📈 Monitoreando uso de CPU y Memoria en vivo (Presiona CTRL+C para salir)..."
	docker stats

mem-check:
	@echo "💾 Inspeccionando espacio ocupado por Docker en el disco duro..."
	docker system df

clean-docker:
	@echo "🧹 Realizando limpieza profunda de Docker (Caché, imágenes sin uso, contenedores parados)..."
	docker system prune -a -f --volumes

# ==========================================
# 📦 REPOMIX: EXTRACCIÓN DE PROYECTO
# ==========================================
.PHONY: repofront repoback repoall

repofront:
	@echo "🧠 Extrayendo código del Frontend..."
	npx repomix frontend -o repomix-frontend.xml

repoback:
	@echo "🧠 Extrayendo código del Backend..."
	npx repomix backend -o repomix-backend.xml

repoall:
	@echo "🧠 Extrayendo TODO el proyecto..."
	npx repomix . -o repomix-full.xml

# ==========================================
# ⚙️ MANTENIMIENTO E INSTALACIONES
# ==========================================
.PHONY: installfront

installfront:
	@echo "📦 Instalando dependencias del frontend limpiamente..."
	cd frontend && rm -rf node_modules package-lock.json && npm install

# ==========================================
# 🐙 GIT: AUTOMATIZACIÓN DE CONTROL DE VERSIONES
# ==========================================
.PHONY: git

git:
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
