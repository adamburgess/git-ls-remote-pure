import fetch, { RequestInit } from 'node-fetch'
import merge from 'merge-options'

async function lsRemote(url: string, fetchOptions?: RequestInit) {
    url += '/info/refs?service=git-upload-pack';

    const defaultOpts = {
        headers: {
            'User-Agent': 'npm:git-ls-remote-pure'
        }
    };
    const opts: RequestInit = fetchOptions ? merge(defaultOpts, fetchOptions) : defaultOpts;

    const result = await fetch(url, opts);
    if (result.status !== 200) throw new Error(`Failed to ls remote: ${result.statusText}`);

    const body = await result.buffer();

    let i = 0;
    let lines = [];
    while (i < body.length) {
        const lenBytes = parseInt(body.toString('ascii', i, i + 4), 16);
        if (lenBytes == 0) {
            i += 4;
        } else {
            const line = body.toString('ascii', i + 4, i += lenBytes);
            lines.push(line.trim());
        }
    }
    const refs = parseLines(lines);

    const HEAD = refs.find(f => f.name === 'HEAD')?.sha;
    const branchHeader = 'refs/heads/';
    const branches = Object.fromEntries(
        refs.filter(f => f.name.startsWith(branchHeader))
            .map(f => [f.name.substr(branchHeader.length), f.sha])
    );
    const tagHeader = 'refs/tags/';
    const tags = Object.fromEntries(
        refs.filter(ref => ref.name.startsWith(tagHeader))
        .map(f => [f.name.substr(tagHeader.length), f.sha])
    );
    
    return {
        HEAD,
        branches,
        tags,
        refs: Object.fromEntries(refs.map(({name, sha}) => [name, sha]))
    };
}

export default lsRemote;

function parseLines(lines: string[]) {
    lines.shift();
    if (lines[0].indexOf('\0')) {
        // non_empty_list
        lines[0] = lines[0].substr(0, lines[0].indexOf('\0'));
    } else if (lines[0].split(' ')[1] == 'capabilities^{}') {
        // empty_list
        return [];
    }

    // parse into any_ref
    const refs = lines.map(line => line.split(' ')).map(line => ({
        name: line[1],
        sha: line[0]
    }));

    // filter any peeled_ref's out
    const filtered = refs.filter(ref => ref.name.length >= 3 ? ref.name.substr(-3) !== '^{}' : true);

    return filtered;
}

// for reference:
/*
  smart_reply     =  PKT-LINE("# service=$servicename" LF)
         ref_list
         "0000"
  ref_list        =  empty_list / non_empty_list

  empty_list      =  PKT-LINE(zero-id SP "capabilities^{}" NUL cap-list LF)

  non_empty_list  =  PKT-LINE(obj-id SP name NUL cap_list LF)
         *ref_record

  cap-list        =  capability *(SP capability)
  capability      =  1*(LC_ALPHA / DIGIT / "-" / "_")
  LC_ALPHA        =  %x61-7A

  ref_record      =  any_ref / peeled_ref
  any_ref         =  PKT-LINE(obj-id SP name LF)
  peeled_ref      =  PKT-LINE(obj-id SP name LF)
         PKT-LINE(obj-id SP name "^{}" LF
*/