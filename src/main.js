const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const parse = require('./parse');

const DEFAULT_PROXY = 'SOCKS5 127.0.0.1:1080';
const TEMPLATE_PAC_PATH = path.join(__dirname, './template.pac');
const GFWLIST_PATH = path.join(__dirname, '../gfwlist.txt');
const GFWLIST_RAW_PATH = path.join(__dirname, '../gfwlist.raw');
const GFWLIST_PAC_PATH = path.join(__dirname, '../gfwlist.pac');
const CUSTOM_PAC_PATH = path.join(__dirname, '../my.pac');

const get_gfw_rules = async gfwlist_path => {
    const gfw_raw = (await promisify(fs.readFile)(gfwlist_path)).toString();
    const gfw_data = Buffer.from(gfw_raw, 'base64').toString();

    fs.writeFile(GFWLIST_RAW_PATH, gfw_data, () => {});
    return parse(gfw_data);
};

const main = async () => {
    const gfw_rules = await get_gfw_rules(GFWLIST_PATH);
    const custom_rules = require('./custom.js');

    const my_rules = Object.keys(gfw_rules).reduce((prev, key) => {
        prev[key] = [...gfw_rules[key]];

        if (custom_rules.hasOwnProperty(key)) {
            prev[key] = [
                ...custom_rules[key],
                ...prev[key],
            ];

            return prev;
        }

        return prev.filter(Boolean);
    }, {});

    const template_pac = (await promisify(fs.readFile)(TEMPLATE_PAC_PATH)).toString();
    const timestamp = (new Date()).toISOString();

    await promisify(fs.writeFile)(
        GFWLIST_PAC_PATH,
        template_pac
            .replace('{%TIMESTAMP%}', timestamp)
            .replace('{%PROXY%}', DEFAULT_PROXY)
            .replace('{%RULES%}', JSON.stringify(gfw_rules, null, 4))
    );

    await promisify(fs.writeFile)(
        CUSTOM_PAC_PATH,
        template_pac
            .replace('{%TIMESTAMP%}', timestamp)
            .replace('{%PROXY%}', DEFAULT_PROXY)
            .replace('{%RULES%}', JSON.stringify(my_rules, null, 4))
    );

    console.log(`pac file generated successful!`);
};

main();
