
build-frontend:
	cd src && npm run build

build-backend:
	cd backend && npm run build

build-proxy:
	cd proxy-server && npm run build

build-all: build-frontend build-backend build-proxy
