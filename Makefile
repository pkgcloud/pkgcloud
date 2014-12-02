MOCHA_CMD = MOCK=on ./node_modules/.bin/mocha
MOCHA_OPTS = --require blanket -t 4000 test/*/*/*-test.js test/*/*/*/*-test.js
DEFAULT_REPORT_OPTS = --reporter spec
HTML_REPORT_OPTS = --reporter html-cov > coverage.html
COVERALLS_REPORT_OPTS = --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

check: test

test: test-unit

cov: test-cov-html

travis: lint test-unit test-cov-coveralls

test-unit:
	@echo "$(MOCHA_CMD) $(MOCHA_OPTS) $(REPORT_OPTS)"
	@NODE_ENV=test $(MOCHA_CMD) $(MOCHA_OPTS) $(REPORT_OPTS)

test-cov-html:
	@echo "$(MOCHA_CMD) $(MOCHA_OPTS) $(HTML_REPORT_OPTS)"
	@NODE_ENV=test $(MOCHA_CMD) $(MOCHA_OPTS) $(HTML_REPORT_OPTS)

test-cov-coveralls:
	@echo "$(MOCHA_CMD) $(MOCHA_OPTS) $(COVERALLS_REPORT_OPTS)"
	@NODE_ENV=test $(MOCHA_CMD) $(MOCHA_OPTS) $(COVERALLS_REPORT_OPTS)

lint:
	./node_modules/.bin/jshint --exclude-path .gitignore .

.PHONY: test
