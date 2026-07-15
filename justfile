#!/usr/bin/env just --justfile

# Deploy No Strings Tools to nucka
deploy:
    #!/bin/bash
    set -e

    echo "📦 Creating tarball..."
    tar --exclude='.git' --exclude='node_modules' --exclude='.DS_Store' \
        -czf /tmp/nostrings.tar.gz \
        --transform='s,^,nostrings/,' \
        .

    echo "🚀 Uploading to nucka..."
    scp /tmp/nostrings.tar.gz nucka:/tmp/nostrings.tar.gz

    echo "📂 Extracting and deploying on nucka..."
    ssh nucka << 'EOF'
        set -e
        mkdir -p /srv/blog/nostrings
        cd /srv/blog/nostrings
        tar -xzf /tmp/nostrings.tar.gz --strip-components=1
        chmod -R 755 /srv/blog/nostrings
        echo "✓ Deployed to /srv/blog/nostrings/index.html"
        rm /tmp/nostrings.tar.gz
    EOF

    echo "✅ Deploy complete!"
    rm /tmp/nostrings.tar.gz

# Show usage
@help:
    echo "No Strings Tools Deploy"
    echo ""
    echo "Usage:"
    echo "  just deploy    Deploy to nucka:/srv/blog/nostrings/"
