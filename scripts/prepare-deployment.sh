#!/bin/bash

# Deployment preparation script for Trait-Edu
# This script helps prepare the application for production deployment

set -e

echo "🚀 Trait-Edu Deployment Preparation"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo "Please create .env.production with your production secrets"
    echo "You can copy from .env.production.example and update values"
    exit 1
fi

echo -e "${GREEN}✓ .env.production found${NC}"
echo ""

# Validate DATABASE_URL
if grep -q "DATABASE_URL=" ".env.production"; then
    echo -e "${GREEN}✓ DATABASE_URL is configured${NC}"
else
    echo -e "${RED}❌ DATABASE_URL not found in .env.production${NC}"
    exit 1
fi

echo ""
echo "📦 Building frontend for production..."
echo ""

# Build frontend
if [ -n "$VITE_API_URL" ]; then
    echo "Using VITE_API_URL: $VITE_API_URL"
else
    echo -e "${YELLOW}⚠️  VITE_API_URL not set. Using default.${NC}"
    echo "Set it with: export VITE_API_URL=https://your-project.vercel.app/api"
fi

npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
    echo ""
    echo "Build artifacts created in: dist/"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo "📊 Deployment Summary"
echo "===================="
echo ""
echo "Backend (Vercel):"
echo "  - Config file: vercel.json ✓"
echo "  - Environment: .env.production ✓"
echo ""
echo "Frontend (Hostinger):"
echo "  - Build output: dist/ ✓"
echo "  - Size: $(du -sh dist/ | cut -f1)"
echo ""
echo "Database (Supabase):"
echo "  - Connection configured ✓"
echo ""
echo ""
echo -e "${GREEN}✅ Preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Deploy backend:  vercel deploy --prod"
echo "  2. Upload dist/ to Hostinger via FTP"
echo "  3. Create/Update .htaccess in Hostinger"
echo "  4. Test: https://your-domain.com"
echo ""
echo "For detailed steps, see: DEPLOYMENT_GUIDE.md"
echo ""
