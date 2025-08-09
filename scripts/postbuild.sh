#!/bin/bash
# Copy index.html to 404.html for SPA routing support on GitHub Pages
cp dist/index.html dist/404.html
echo "Created 404.html for SPA routing"