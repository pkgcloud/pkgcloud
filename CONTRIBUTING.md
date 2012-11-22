# Contributing to Pkgcloud

We believe in the power of open source and we know that the quality of an open source project is determined by its documentation. This means we are committed to maintaining high quality up-to-date docs to incentivize developers to contribute.

If you are interested in contributing to pkgcloud, **here is how you can help.**

## Reporting issues

The only issues we accept are bug reports or feature requests. Bugs must be isolated and reproducible problems which we can fix within the code base. Before opening any issues, please read the following guidelines.

1. **Search for existing issues.** First of all, please check if someone else has already reported the issue. If the issue has already been reported, a fix may already be in progress. 
2. **Create an isolated and reproducible test case.** We use [vows](http://vowsjs.org/) to make test cases, and the whole test suite already has a variety of helpers and utils to make a complete test. Check the `test/` directory to find examples of tests and info on how to use the available helpers. Then try to make and submit a valid vows test. This will help us find the problem, make it easier to make feature requests, and help us understand what you really want. It is very possible that your test will eventually be added to the test suite.
3. **Include logs and backtraces** Please try to include some logs or backtrace of your problem or error.
4. **Share as much information as possible.** Include operating system and version, `node` and `npm` version, version of Pkgcloud. Also include steps to reproduce the bug and any further information about your environment

## Key branches

- `master` is the latest, deployed version.
- `gh-###` branch related to some github issue, the `###` is the number of the issue like `gh-28` or `gh-33` (normally used to open pull requests)

## Pull requests
 
- Please follow the style guide being used in the pkgcloud code base.
- If you are adding new methods please include documentation above the function definition.
- If you are adding a new provider or new service please add the complete documentation to the `docs/` directory.
- Please tag your commit depending what it does (`[misc]`, `[docs]`, `[database]`, `[compute]`)
- Follow the style guide in code and docs.
- Your pull request should pass the tests and the `travis-ci` build. This will be reviewed by the maintainer.


## Coding standards: JS

- Use semicolons! Semicolons `;` **must** be added at the end of every statement, **except** when the next character is a closing bracket `}`.
- Identifiers bound to constructors **must** start with a capital letter.
- Identifiers bound to a variable **must** be CamelCased, and start with a lowercase letter.
- Long names are bad. There is usually a noun that can represent the concept of your identifier concisely. If your identifier is longer than 20 characters, reconsider the name.
- 2 spaces (no tabs)
- strict mode.
- Always declare variables at the top of your functions.
- Control-flow statements, such as `if`, `while` and `for` must have a space between the keyword and the left parenthesis.
- Never declare a function within a block.
- Braces `{ }` must be used in all circumstances.
- When it comes to Strings remember: Always use single quotes and Never use multi-line string literals.
- Try to be "Elegant" 

## Adding tests to my pull requests

The tests are written using [vows](http://vowsjs.org/) and given the nature of `pkgcloud` test against third-party APIs are very slow specially in case of IaaS providers, so, we encourage the use of [`nock`](https://github.com/flatiron/nock) for mocking the responses.

Be familiar with the whole test suite and its helpers and other utilities on `test/` directory, read it to see examples of tests.

Add mocking to your pull request should be really easy, first write the test using vows, require the `nock` library:

``` js
var vows = require('vows');
// ...
var nock = require('nock');
// ...
```

The easy way is using the `recorder.rec()` method offer by `nock` just add this before the test declaration:

``` js
nock.recorder.rec();
```

This will show you all the requests made by the test in the *nock definition*, go replace the `host` and other information using variables, also you can use the `loadFixture()` helper in case your reponse is too big. As final point add the conditional for run `nock` just when is enable, please put definitions inside this conditional:

``` js
if (process.env.NOCK) {
  // Put here all the nock definitions needed
}
```

## License

By contributing your code, you agree to license your contribution under the terms of the MIT: https://github.com/nodejitsu/pkgcloud/blob/master/LICENSE