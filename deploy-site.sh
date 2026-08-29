#!/usr/bin/env zsh
set -e

npm run build
rsync -avz --delete dist/ heiko@panjas.com:/var/www/panjas.com/slopctl/
