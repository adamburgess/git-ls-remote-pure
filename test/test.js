import lsRemote from '../index.js'
import mocha from 'mocha';
import { assert } from 'chai'

describe('ls remote', () => {
    it('works with github', async () => {
        const refs = await lsRemote('https://github.com/adamburgess/git-ls-remote-pure.git');
        assert.isString(refs.HEAD);
        assert.isObject(refs.tags);
        assert.isObject(refs.branches);
        assert.equal(refs.tags['2.0.2'], '02aa2fc2359163dac356c9008482b0ef82556849');
    })
    it('works with gitlab', async () => {
        const refs = await lsRemote('https://gitlab.com/adamburgess/blank');
        assert.equal(refs.branches.other, '1aed54da2c07a4ef5fb049190f11db0b20621758');
        assert.equal(refs.refs['refs/heads/other'], '1aed54da2c07a4ef5fb049190f11db0b20621758');
    })
})
