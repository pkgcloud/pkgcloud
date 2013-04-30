MOCHA_OPTS=test/*/*/*-test.js test/*/*/*/*-test.js
REPORTER = spec

check: test

test: test-unit

test-unit:
	@NODE_ENV=test NOCK=on ./node_modules/.bin/mocha \
	    --reporter $(REPORTER) \
		$(MOCHA_OPTS)

.PHONY: test