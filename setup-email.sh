#!/bin/bash

echo "🔧 Setting up Email Notifications for ISOWS-INDIA"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from example.env..."
    cp example.env .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "📧 Email Configuration Required:"
echo "================================"
echo ""
echo "To enable email notifications, you need to configure email settings in your .env file:"
echo ""
echo "1. EMAIL_USER: Your Gmail address (e.g., your-email@gmail.com)"
echo "2. EMAIL_PASS: Your Gmail App Password (not your regular password)"
echo "3. FRONTEND_URL: Your frontend URL (e.g., http://localhost:3000)"
echo ""
echo "🔐 How to get Gmail App Password:"
echo "1. Go to your Google Account settings"
echo "2. Enable 2-Factor Authentication if not already enabled"
echo "3. Go to Security > 2-Step Verification > App passwords"
echo "4. Generate a new app password for 'Mail'"
echo "5. Use this app password as EMAIL_PASS in your .env file"
echo ""
echo "📝 Example .env configuration:"
echo "EMAIL_USER=your-email@gmail.com"
echo "EMAIL_PASS=abcd efgh ijkl mnop"
echo "FRONTEND_URL=http://localhost:3000"
echo ""
echo "⚠️  Important: Never commit your .env file to version control!"
echo ""
echo "✅ Email setup instructions complete!"
echo "   Edit your .env file with the email credentials above."
