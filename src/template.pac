// https://github.com/conwnet/gfwlist-pac

var proxy = '{%PROXY%}';

var rules = {%RULES%};

function startsWith(source, prefix) {
    var i, l;
    for (i = 0, l = prefix.length; i < l; i++) {
        if (source.charAt(i) !== prefix.charAt(i)) {
            return false;
        }
    }
    return true;
}

function FindProxyForURL(url, hostname) {
    var i, l;
    var PREFIX = rules.PREFIX;
    var INCLUDE = rules.INCLUDE;
    var REGEXP = rules.REGEXP;

    for (i = 0, l = PREFIX.length; i < l; i++) {
        if (startsWith(hostname, PREFIX[i])) {
            return proxy;
        }
    }

    for (i = 0, l = INCLUDE.length; i < l; i++) {
        if (hostname.indexOf(INCLUDE[i]) !== -1) {
            return proxy;
        }
    }

    for (i = 0, l = REGEXP.length; i < l; i++) {
        if ((new RegExp(REGEXP[i])).test(url)) {
            return proxy;
        }
    }

    return 'DIRECT';
}
