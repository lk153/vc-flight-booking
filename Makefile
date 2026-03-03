.PHONY: dev build start stop install lint clean setup pwa-icons

# Development
dev:
	npm run dev

build:
	npm run build

start:
	npm run start

stop:
	@lsof -ti:3000 | xargs kill 2>/dev/null && echo "Server stopped" || echo "No server running on port 3000"

lint:
	npm run lint

# Setup
install:
	npm install

setup: install
	cp -n .env.example .env.local 2>/dev/null || true
	@echo "Setup complete. Edit .env.local with your API keys."

# Clean
clean:
	rm -rf .next node_modules

# Shadcn UI components
ui-add:
	@read -p "Component name: " name; npx shadcn@latest add $$name

# Database (for future Prisma integration)
db-push:
	npx prisma db push

db-migrate:
	npx prisma migrate dev

db-seed:
	npx prisma db seed

db-studio:
	npx prisma studio

# PWA: regenerate icons from SVG source
pwa-icons:
	npx svgexport public/icon.svg public/icon-512.png 512:512
	npx svgexport public/icon.svg public/icon-192.png 192:192
	npx svgexport public/icon.svg public/apple-touch-icon.png 180:180
	npx svgexport public/icon.svg public/favicon.ico 32:32
	@echo "PWA icons generated."

# VAPID keys for push notifications
vapid-keys:
	npx web-push generate-vapid-keys

# Cron: manually trigger price check
check-prices:
	curl -s -X POST http://localhost:3000/api/cron/check-prices -H "Content-Type: application/json" | jq .
