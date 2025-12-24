#!/bin/bash

# prep.sh - Environment Setup Script
# This script generates secure random secrets and creates .env files
# DO NOT commit sensitive .env files to version control!

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Finance Tracker - Environment Setup  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted. Existing .env file kept.${NC}"
        exit 1
    fi
fi

# Function to generate random string
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Function to generate random password
generate_password() {
    openssl rand -base64 24 | tr -d "=+/" | cut -c1-24
}

echo -e "${GREEN}Generating secure random secrets...${NC}"
echo ""

# Generate secrets
DB_USER="financeuser"
DB_PASSWORD=$(generate_password)
DB_NAME="financetracker"
JWT_SECRET=$(generate_secret)

# Create .env file
cat > .env << EOF
# Database Configuration
# Generated on: $(date)
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# JWT Secret (auto-generated)
JWT_SECRET=${JWT_SECRET}
EOF

# Set secure permissions
chmod 600 .env

echo -e "${GREEN}✓ .env file created successfully!${NC}"
echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo -e "  Database User: ${YELLOW}${DB_USER}${NC}"
echo -e "  Database Name: ${YELLOW}${DB_NAME}${NC}"
echo -e "  Database Password: ${YELLOW}[HIDDEN - check .env file]${NC}"
echo -e "  JWT Secret: ${YELLOW}[HIDDEN - check .env file]${NC}"
echo ""
echo -e "${GREEN}✓ Secrets have been securely generated${NC}"
echo -e "${GREEN}✓ File permissions set to 600 (read/write owner only)${NC}"
echo ""
echo -e "${YELLOW}Important Security Notes:${NC}"
echo -e "  • Never commit .env file to version control"
echo -e "  • The .env file is already in .gitignore"
echo -e "  • Keep your secrets safe and secure"
echo -e "  • For production, use Docker secrets or environment variable injection"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Review the generated .env file"
echo -e "  2. Run: ${GREEN}docker-compose up -d${NC}"
echo -e "  3. Run migrations: ${GREEN}docker-compose exec backend npx prisma migrate deploy${NC}"
echo ""
echo -e "${GREEN}Setup complete! 🎉${NC}"
