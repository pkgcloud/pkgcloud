# Contributing to Pkgcloud

We believe in the power of open source and we know that the quality of a final product is also measured in their documentation, so we are committed to be well documented to induce developers to contribute to the project.

If you are reading this maybe is because you want to contribute something to the project, **Here is how you can help.**

## Reporting issues

We only accept issues that are bug reports or feature requests. Bugs must be isolated and reproducible problems that we can fix within the code base. Please read the following guidelines before opening any issue.

1. **Search for existing issues.** Please first of all, check if someone else have reported the issue before. If the issue is already reported then maybe someone is work on it or better there is a fix available.
2. **Create an isolated and reproducible test case.** We use [vows](http://vowsjs.org/) as tool for make test cases, and the whole test suite already have some helpers and utils for make a complete test. Go check the `test` folders for example of tests and how to use those helpers. Afterwards try to make and submit a vows valid test, that would help us a lot for find the problem, also is super easy do it in this way for feature request, more easy to us understand what really you want. It is very possible that your test will eventually added to the test suite.
3. **Include logs and backtraces** Please try to include some logs or backtrace of your problem or error, that help a lot to identify wich part is the involved.
4. **Share as much information as possible.** Include operating system and version, `node` and `npm` version, version of Pkgcloud. Also include steps to reproduce the bug and any further information about your environment

## Key branches

- `master` is the latest, deployed version.
- `gh-###` branch related to some github issue, the `###` is the number of the issue like `gh-28` or `gh-33` (normally used to open pull requests)

## Pull requests
 
- Please follow the style guide that is being used in code base.
- If you are adding new methods please include a documentation above the function definition
- If you are adding a new provider or new service please add the complete documentation to the `docs/` directory
- Try to tag your commits depending what does (`[misc]`, `[docs]`, `[database]`, `[compute]`)
- Follow style guide on code and docs
- Your pull request should pass the tests and the `travis-ci` build, that will be reviewed by the maintainer.


## Coding standards: JS

- Use semicolons!. Semicolons `;` **must** be added at the end of every statement, **except** when the next character is a closing bracket `}`.
- Identifiers bound to constructors **must** start with a capital.
- Identifiers bound to a variable **must** be CamelCased, and start with a lowercase letter.
- Also, long names are bad. There is usually a noun that can represent the concept of your identifier concisely if your identifier is longer than 20 characters, reconsider the name.
- 2 spaces (no tabs)
- strict mode.
- Always declare variables at the top of functions.
- Control-flow statements, such as `if`, `while` and `for` must have a space between the keyword and the left parenthesis.
- Never declare a function within a block.
- Braces `{ }` must be used in all circumstances.
- Related to Strings remember: Always use single quotes and Never use multi-line string literals.
- Try to be "Elegant" (no mandatory)


## License

By contributing your code, you agree to license your contribution under the terms of the MIT: https://github.com/nodejitsu/pkgcloud/blob/master/LICENSE