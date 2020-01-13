#
# Makefile
# edgardleal, 2019-11-30 17:51
#

DONE = echo ✓ $@ done
SOURCES = $(wildcard src/*/*.js)
PROJECTS=\
 nginx \
 users \
 bff

APP_NAME = $(shell cat package.json 2>/dev/null | $(call JSON_GET_VALUE,name))
modules = $(wildcard node_modules/*/*.js)
.PHONY: run all update start clear $(PROJECTS)

all:
	docker-compose up nginx

run: all

%/.env: docker-compose.yml # cant be .env.example because will lost config when update
	cp "$@.example" $@
	echo 'NOTE: You should check each .env file if is accordingly with your environment'

.meta: docker-compose.yml
	@mkdir .meta

sanar-users/.env.example: docker-compose.yml
	git submodule update --checkout --init --recursive
	$(MAKE) update


start: ## start: checkout and update all git submodules
start: all

$(PROJECTS): 
	docker-compose up -d $@

clear: ## clear: remove all git submodules
	@echo $(PROJECTS) | tr ' ' '\n' | xargs -n 1 rm -rf 
	@$(DONE)

stop: ## stop: stop all containers related to casinha
	docker-compose down

docker-clean: ## docker-clean: remove all docker images related to cainha
docker-clean: stop
	docker images | grep casinha |  awk '{ print $$1 }' | xargs -n 1 docker rmi
	docker images | grep '<none>' |awk '{ print $$1 }' | xargs -n 1 docker rmi

hel%: ## help: Show this help message.
	@echo "usage: make [target] ..."
	@echo ""
	@echo "targets:"
	@grep -Eh '^.+:\ ##\ .+' ${MAKEFILE_LIST} | cut -d ' ' -f '3-' | column -t -s ':'


# vim:ft=make
#
