DOCKER_IMAGE_NAME = shibaswap-frontend
DOCKER_CONTAINER_NAME = shibaswap-frontend-container

# Default Docker image tag
DEFAULT_TAG := latest

# Get the Docker image tag from the environment variable, or use the default
IMAGE_TAG ?= $(DEFAULT_TAG)

get-deps:
	yarn install --ignore-scripts --frozen-lockfile

test:
	yarn test

build:
	yarn build

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME):$(IMAGE_TAG) .

docker-run:
	docker run -d --name $(DOCKER_CONTAINER_NAME) -p 3000:3000 $(DOCKER_IMAGE_NAME)

docker-clean:
	docker stop $(DOCKER_CONTAINER_NAME) || true
	docker rm $(DOCKER_CONTAINER_NAME) || true

clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf dist

help:
	@echo "Usage: make [target]"
	@echo "Targets:"
	@echo "  get-deps       Install project dependencies"
	@echo "  test           Run tests"
	@echo "  build          Build the application"
	@echo "  docker-build   Build Docker image"
	@echo "  docker-run     Run Docker container"
	@echo "  docker-stop    Stop and remove Docker container"
	@echo "  clean          Clean up generated files"