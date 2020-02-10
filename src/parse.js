const rules = {
    PREFIX: [],
    INCLUDE: [],
    REGEXP: [],
};

const resolve_line = line => {
    let text = line.trim();

    if (
        text === ''
        || text.startsWith('!')
        || text.startsWith('[')
        // I think hostname in exception rules can be accessed
        || text.startsWith('@')
    ) {
        return '';
    }

    // exact prefix without protocol
    if (text.startsWith('||')) {
        // 1. ||*.a.b
        if (text.startsWith('||*')) {
            const rule = text.match(/^\|\|\*([^/*|:]+)/)[1];
            rules.INCLUDE.push(rule);
            return;
        }

        // 1. ||a.b.com
        // 2. ||a.b.com/123
        // 3. ||a.b.*
        // 4. ||a.b.com|
        // 5. ||a.b.com:8000 => trim port now
        const rule = text.match(/^\|\|([^/*|:]+)/)[1];
        rules.PREFIX.push(rule);
        return;
    }

    // exact prefix
    if (text.startsWith('|')) {
        // 1. |https://*.a.b.com
        if (text.match(/^\|https?:\/\/\*/)) {
            const rule = text.match(/^\|https?:\/\/\*([^/*|:]+)/)[1];
            rules.INCLUDE.push(rule);
            return;
        }

        const rule = text.match(/^\|https?:\/\/([^/*|:]+)/)[1];
        rules.PREFIX.push(rule);
        return;
    }

    // regexp
    if (text.startsWith('/') && text.endsWith('/')) {
        const rule = text.slice(1, -1);
        rules.REGEXP.push(rule);
        return;
    }

    /* other rule will be INCLUDE */

    // remove leading `protocol`
    text = text.replace(/[a-zA-Z0-9]+:\/\//, '');

    // remove leading `*`
    if (text.startsWith('*')) {
        text = text.slice(1);
    }

    // remove text after `*`
    const star_index = text.indexOf('*');
    if (star_index !== -1) {
        text = text.slice(0, star_index);
    }

    // remove text after `/`
    const slash_index = text.indexOf('/');
    if (slash_index !== -1) {
        text = text.slice(0, slash_index);
    }

    rules.INCLUDE.push(text);
};

const parse = data => {
    const lines = data.split('\n');

    lines.forEach(resolve_line);
    return rules;
};

module.exports = parse;
