#!/bin/bash

# Create api directory structure
mkdir -p api/models api/routes api/middleware api/utils api/config api/services api/controllers

# Copy server files to api directory
cp -r server/models/* api/models/ 2>/dev/null || :
cp -r server/routes/* api/routes/ 2>/dev/null || :
cp -r server/middleware/* api/middleware/ 2>/dev/null || :
cp -r server/utils/* api/utils/ 2>/dev/null || :
cp -r server/config/* api/config/ 2>/dev/null || :
cp -r server/services/* api/services/ 2>/dev/null || :
cp -r server/controllers/* api/controllers/ 2>/dev/null || :
cp server/server.js api/ 2>/dev/null || :
cp server/.env api/ 2>/dev/null || :

echo "✓ Server files copied to api directory"
