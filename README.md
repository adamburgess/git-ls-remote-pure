# git-ls-remote-pure

A pure node implementation of `git ls-remote` for HTTPS repos.

usage:

```js
import lsRemote from 'git-ls-remote-pure';
const ls = await lsRemote('https://github.com/adamburgess/git-ls-remote-pure.git');
/*
{
  HEAD: '02aa2fc2359163dac356c9008482b0ef82556849',
  branches: {
    master: '02aa2fc2359163dac356c9008482b0ef82556849'
  },
  tags: {
    '1.0.0': '33974eb9ed270d2888f5a97d068f9436d1fc863d',
    '2.0.0': '62178b17258d82a764721a4714c5e75628c0d378',
    '2.0.1': '38080f93717dec91134cdb60a6fb9d6dc62301df',
    '2.0.2': '02aa2fc2359163dac356c9008482b0ef82556849'
  },
  refs: {
    HEAD: '02aa2fc2359163dac356c9008482b0ef82556849',
    'refs/heads/master': '02aa2fc2359163dac356c9008482b0ef82556849',
    'refs/tags/1.0.0': '33974eb9ed270d2888f5a97d068f9436d1fc863d',
    'refs/tags/2.0.0': '62178b17258d82a764721a4714c5e75628c0d378',
    'refs/tags/2.0.1': '38080f93717dec91134cdb60a6fb9d6dc62301df',
    'refs/tags/2.0.2': '02aa2fc2359163dac356c9008482b0ef82556849'
  }
}
*/
```

Need to connect to private repos? Provide an options object with authentication that `node-fetch` will understand.
