const rules = {
    PREFIX: [],
    SUFFIX: [],
    INCLUDE: [],
    REGEXP: [],
};

const resolve_unused_line = text => {
    if (
        text === ''
        || text.startsWith('!')
        || text.startsWith('[')
        // I think hostname in exception rules can be accessed
        || text.startsWith('@')
    ) {
        return true;
    }

    return false;
};

const resolve_anchor_line = text => {
    if (!text.startsWith('||')) {
        return false;
    }

    text = text.match(/^\|\|([^/|:]+)/)[1];
    const last_star_index = text.lastIndexOf('*');
    // 1. ||*.a.com
    // 2. ||a.*.b.com
    if (last_star_index !== -1) {
        text = text.slice(last_star_index + 1);
    }

    // text may be empty for `||a.b.*`, ignore it
    if (text) {
        rules.SUFFIX.push(text);
    }

    return true;
};

const resolve_prefix_line = text => {
    if (!text.startsWith('|')) {
        return false;
    }

    text = text.match(/\|https?:\/\/([^/|:]+)/)[1];
    const last_star_index = text.lastIndexOf('*');
    if (last_star_index !== -1) {
        // startsWith `*`
        // 1. |*.a.b.com
        // 2. |a.*.b.com => use .b.com
        const rule = text.slice(last_star_index + 1);
        rule && rules.INCLUDE.push(rule);
        return true;
    }

    if (text) {
        rules.PREFIX.push(text);
    }

    return true;
};

const resolve_regexp_line = text => {
    if (!text.startsWith('/')) {
        return false;
    }

    // may be not regexp, but i cant resolve it
    if (!text.endsWith('/')) {
        return true;
    }

    rules.REGEXP.push(text.slice(1, -1));
    return true;
};

const resolve_line = line => {
    let text = line.trim();

    if (resolve_unused_line(text)) {
        return;
    }

    // startsWith ||
    if (resolve_anchor_line(text)) {
        return;
    }

    // startsWith |
    if (resolve_prefix_line(text)) {
        return;
    }

    if (resolve_regexp_line(text)) {
        return;
    }

    /* other rules will be INCLUDE */

    // remove leading `protocol`
    text = text.replace(/^[a-zA-Z0-9]+:\/\//, '');

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
