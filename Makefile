node_modules/license-check-and-add:
	npm ci

node_modules/prettier:
	npm ci

.PHONY: format
format:
	npm run license:fix && npm run format

.PHONY: develop
develop:
	cd client && $(MAKE) develop

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-license
test-license: LICENSE LICENSE_HEADER
	npm run test:license

.PHONY: test-lint
test-lint:
	cd client && $(MAKE) test-lint