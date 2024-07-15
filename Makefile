TEST_E2E_DOCKER_COMPOSE=docker-compose

.PHONY: develop
develop:
	npm run start

PHONY: test-all
test-all:
	$(MAKE) test-format
	$(MAKE) test-lint
	$(MAKE) test-types
	$(MAKE) test-unit-tests

.PHONY: test-unit-tests
test-unit-tests:
	npm run test:unit

.PHONY: test-audit
test-audit:
	npm run test:audit

.PHONY: test-format
test-format:
	npm run test:format

.PHONY: test-license
test-license:
	npm run test:license

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-types
test-types: node_modules/typescript
	npm run test:types

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1

.PHONY: format
format: LICENSE LICENSE_HEADER
	npm run license:fix && npm run format

.PHONY: license
license: LICENSE LICENSE_HEADER
	npm run license:fix 


.PHONY: test-e2e-exec
test-e2e-exec:
	$(TEST_E2E_DOCKER_COMPOSE) exec -T cypress npx cypress run

.PHONY: test-e2e-build
test-e2e-build:
	$(TEST_E2E_DOCKER_COMPOSE) build