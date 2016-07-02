import request from 'request'

export default requestOpts =>
  new Promise((resolve, reject) => {
    if (typeof requestOpts == 'string')
      requestOpts = {
        url: requestOpts
      };
    else if(requestOpts.uri) {
      requestOpts.url = requestOpts.uri;
      delete requestOpts.uri;
    }
    requestOpts.url += '/info/refs?service=git-upload-pack';
    requestOpts.encoding = null;
    request(requestOpts, (e, response) => {
      if (response.statusCode != 200) return reject(response.statusCode);
      var lines = [];
      var body = response.body;
      var i = 0;
      while (i < body.length) {
        var lenBytes = parseInt(body.toString('ascii', i, i + 4), 16);
        if (lenBytes == 0) {
          i += 4;
        } else {
          var line = body.toString('ascii', i + 4, i += lenBytes);
          lines.push(line.trim());
        }
      }
      var refs = parseLines(lines);
      resolve(refs);
    });
  });

function parseLines(lines) {
  lines.shift();
  if (lines[0].indexOf('\0')) {
    // non_empty_list
    lines[0] = lines[0].substr(0, lines[0].indexOf('\0'));
  } else if (lines[0].split(' ')[1] == 'capabilities^{}') {
    // empty_list
    return [];
  }

  // parse into any_ref
  var refs = lines.map(line => line.split(' ')).map(line => ({
    name: line[1],
    sha: line[0]
  }));

  // mark lines as peeled - peeled_ref
  for (var i = 0; i < refs.length - 1; i++) {
    if (refs[i+1].name.substr(-3) == '^{}') {
      refs[i].peeled = true;
      refs[i+1] = undefined;
      i++;
    }
  }
  return refs.filter(ref => ref);
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