#!/usr/bin/env bash

case "$1" in
  # Compile EJS to HTML for index page
  website)
    rm -rf dist/website
    mkdir -p dist/website

    $(npm bin)/ejs-cli "*.ejs" --base-dir sites/website --out dist/website --options .serverless/output.json
    $(npm bin)/node-sass  --output-style compressed sites/website/style.scss > dist/website/style.css
    ;;
  # Compile SASS to CSS
  dashboard)
    rm -rf dist/dashboard
    mkdir -p dist/dashboard

    $(npm bin)/ejs-cli "*.ejs" --base-dir sites/dashboard --out dist/dashboard --options .serverless/output.json
    $(npm bin)/node-sass  --output-style compressed sites/dashboard/style.scss > dist/dashboard/style.css
    ;;
  # Run `html` and `styles` sub tasks per default
  *)
    $0 website
    $0 dashboard
    ;;
esac
