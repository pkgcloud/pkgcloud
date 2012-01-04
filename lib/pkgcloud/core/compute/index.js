var utile = require('utile');flavor = require('./flavor');

utile.mixin(exports, require('./flavor'));
utile.mixin(exports, require('./image'));
utile.mixin(exports, require('./server'));
