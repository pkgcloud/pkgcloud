# MongoLab

The MongoLab API has a better aproach for manage the databases, they have implemented accounts for users, and each account could be provision databases. For create a database with MongoLab you will need first create an account and then use the created account as "owner" of the database.

``` js
// First lets set up the client
var MongoLabClient = pkgcloud.database.createClient({
  provider: 'mongolab',
  username: 'bob',
  password: '1234'
});
```

``` js
// Now lets create an account
// name and email are required fields.
MongoLabClient.createAccount({
  name:'daniel',
  email:'daniel@nodejitsu.com',
  // If you want, you can set your own password 
  // (Password must contain at least one numeric character.)
  // if not mongolab will create a password for you.
  password:'mys3cur3p4ssw0rd'
}, function (err, user) {
  // Now you can provision databases under this user account
  console.log(user);
});
```

``` js
// Now lets create a database
// name and owner are required fields
MongoLabClient.create({
  name:'myDatabase',
  // You need to put the exact name account returned in the account creation.
  owner: user.account.username
}, function (err, database) {
  // That is all
  console.log(database);
});
```

* `new pkgcloud.database.createClient(options, callback)`

#### Accounts
* `pkgcloud.database.createAccount(options, callback)`
* `pkgcloud.database.getAccounts(callback)`
* `pkgcloud.database.getAccount(name, callback)`
* `pkgcloud.database.deleteAccount(name, callback)`

#### Databases
* `pkgcloud.database.create(options, callback)`
* `pkgcloud.database.getDatabases(owner, callback)`
* `pkgcloud.database.getDatabase(options, callback)`
* `pkgcloud.database.remove(options, callback)`