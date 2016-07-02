# git-ls-remote-pure

a pure node implementation of `git ls-remote` for HTTPS repos.

usage:

```js
var lsRemote = require('git-ls-remote-pure');
lsRemote('https://github.com/adamburgess/git-ls-remote-pure.git')
  .then(refs => {
    // refs is an array of { name, sha }
  })
```

need to supply authentication/other things? pass an object, using any option that `npm:request` supports.