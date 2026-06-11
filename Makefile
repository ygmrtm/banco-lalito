IMAGE_NAME=banco-lalito:v2
REMOTE_USER=yg
REMOTE_IP=192.168.100.33
REMOTE_PATH=~/uploads/banco-lalito
TAR_PATH=./tar/banco-lalito-v2.tar

.PHONY: build save transfer deploy clean

build:
	docker build -t $(IMAGE_NAME) .

save: build
	mkdir -p ./tar
	docker save -o $(TAR_PATH) $(IMAGE_NAME)

transfer: save
	scp $(TAR_PATH) docker-compose.yml .env $(REMOTE_USER)@$(REMOTE_IP):$(REMOTE_PATH)/

deploy: transfer
	ssh $(REMOTE_USER)@$(REMOTE_IP) "cd $(REMOTE_PATH) && \
		docker load -i banco-lalito-v2.tar && \
		docker compose up -d && \
		docker image prune -f"

clean:
	rm -rf ./tar

all: deploy