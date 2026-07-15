#!/bin/bash
set -e

echo "📦 Creating frontend tarball..."
tar --exclude='.git' --exclude='node_modules' --exclude='.DS_Store' \
    -czf /tmp/nostrings-frontend.tar.gz \
    --transform='s,^frontend/,nostrings/,' \
    frontend/

echo "🚀 Uploading to nucka..."
scp /tmp/nostrings-frontend.tar.gz nucka:/tmp/nostrings-frontend.tar.gz

echo "📂 Extracting and deploying on nucka..."
ssh nucka << 'EOF'
    set -e
    mkdir -p /srv/blog/nostrings
    cd /srv/blog/nostrings
    tar -xzf /tmp/nostrings-frontend.tar.gz --strip-components=1
    chmod -R 755 /srv/blog/nostrings
    echo "✓ Deployed to /srv/blog/nostrings/index.html"
    rm /tmp/nostrings-frontend.tar.gz
EOF

echo "✅ Deploy complete!"
rm /tmp/nostrings-frontend.tar.gz
