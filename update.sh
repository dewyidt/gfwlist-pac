set -ex

curl -s -o gfwlist.txt https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt

node src/main.js

echo "The PAC files were last updated on $(date -R)" > timestamp.txt
