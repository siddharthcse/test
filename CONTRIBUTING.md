# Contribution guide.

### Getting Started

```bash
# Obligatory init
$ npm install
```

Before contributing any code to the repository, its bet to get familiar with the structure of the code, this can be best accomplished by going through the documentation. 

To view the auto generated documentation provided by code annotations:

```bash
# Generate the docs
$ npm run docs

# View docs
$ npm run demo
```

Documentation will be available on localhost:4001

### TDD/BDD

JMap2 is written alongside of tests, this means that every single method has an accompanying test to prove thatit works and to guard against any breaking changes in the future. 

If adding methods, please add tests alongside them.
If creating a new class please make sure to add the `_tests` folder and place all your tests in there.

You can execute tests using the following command:

```bash
$ npm test
```

It is important to note that JMap2 **DOES NOT CONTAIN A RENDERING ENGINE**. It is a pure data SDK that runs the Jibestream core algorithms. 
