# Google Cloud Vision API Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project"
3. Name: "Shop Scan Pro AI"
4. Click "Create"

## Step 2: Enable Vision API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Cloud Vision API"
3. Click on it and press "Enable"

## Step 3: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name: "shop-scan-pro-vision"
4. Description: "AI analysis for Shop Scan Pro"
5. Click "Create and Continue"

## Step 4: Grant Permissions

1. Role: "Cloud Vision API Service Agent" 
2. Click "Continue" then "Done"

## Step 5: Generate API Key

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Click "Create" - this downloads your key file

## Step 6: Extract Credentials

From the downloaded JSON file, you need:

```json
{
  "project_id": "your-project-id",
  "client_email": "shop-scan-pro-vision@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
}
```

## Step 7: Set Environment Variables

### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add these variables:

```
GOOGLE_CLOUD_PROJECT_ID = your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL = shop-scan-pro-vision@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
```

**Important**: For the private key, make sure to:
- Include the quotes around the entire key
- Keep the `\n` characters as literal `\n` (not actual line breaks)

### For Local Development:
1. Copy `.env.example` to `.env.local`
2. Fill in your Google Cloud credentials
3. Never commit `.env.local` to version control

## Step 8: Test the Integration

1. Install dependencies:
```bash
npm install
```

2. Create a test image analysis:
```bash
curl -X POST https://shopscanpro.com/api/analyze-product \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "url": "https://example.com/product"
  }'
```

## Pricing

**Google Cloud Vision API Pricing:**
- First 1,000 requests/month: FREE
- After that: $1.50 per 1,000 requests
- Text detection: Same pricing
- Logo detection: Same pricing

**Monthly Estimates:**
- 1,000 users × 10 scans = 10,000 requests = $13.50/month
- 5,000 users × 10 scans = 50,000 requests = $73.50/month
- 10,000 users × 10 scans = 100,000 requests = $148.50/month

## Troubleshooting

### "Quota exceeded" error:
- Enable billing on your Google Cloud project
- Check your usage in Cloud Console

### "Permission denied" error:
- Verify service account has correct permissions
- Check that Vision API is enabled

### "Invalid credentials" error:
- Verify environment variables are set correctly
- Ensure private key format is correct (with `\n` characters)

### Local development issues:
- Make sure `.env.local` file exists
- Check that all required environment variables are set
- Restart your development server after adding env vars

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate keys regularly** (every 90 days)
4. **Monitor usage** to detect unauthorized access
5. **Use least privilege** - only grant necessary permissions

## Next Steps

Once Google Cloud Vision is working:
1. Add UPC Database API for product information
2. Implement price comparison APIs
3. Add machine learning models for counterfeit detection
4. Set up monitoring and alerting