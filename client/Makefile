.PHONY: clean
clean:
	rm -rf .cache

.PHONY: develop
develop:
	npm run start

.PHONY: test-lint
test-lint:
	npm run test:lint

.PHONY: test-types
test-types:
	npm run test:types

.PHONY: format
format:
	cd .. && $(MAKE) format
