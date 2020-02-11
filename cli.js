const fs = require('fs');
const path = require('path');
const {parse} = require('url');

const PAC_PATH = path.join(__dirname, './my.pac');

const main = () => {
    const url = process.argv[2];

    if (!url) {
        console.log('Usage: node cli.js <URL>\n');
        return;
    }

    eval(fs.readFileSync(PAC_PATH).toString());

    // full url with protocol, hostname, port, etc.
    if (url.match(/^[a-zA-Z0-9]+:\/\//)) {
        const {href, hostname} = parse(process.argv[2]);
        console.log(FindProxyForURL(href, hostname));
        return;
    }

    // url without leading protocol will be regarded as hostname
    const href = `https://${url}/`;
    console.log(FindProxyForURL(href, url));
};

main();
