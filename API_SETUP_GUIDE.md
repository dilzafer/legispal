# API Setup Guide

## Quick Start

To use this application, you need to obtain API keys from the following services. All APIs listed here offer **FREE** tiers suitable for development and personal use.

---

## Required API Keys

### 1. Congress.gov API ⭐ **REQUIRED**

**What it's for:** Federal bill data, voting records, sponsors, cosponsors

**Get your key:**
1. Visit: https://api.congress.gov/sign-up/
2. Fill out the form with your name and email
3. You'll receive your API key instantly via email

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_CONGRESS_API_KEY=your_congress_api_key_here
```

**Rate Limit:** 5,000 requests/hour (Free)

---

### 2. Gemini AI API ✅ **ALREADY CONFIGURED**

**What it's for:** AI-powered bill analysis, truth scores, polarization detection

**Your key is already set up!** The existing key in `.env.local` is:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBitqvBTLu2wK1uPUi_jJuG_Be7gfKwkPM
```

**Rate Limit:** Varies by tier
**Cost:** Pay-per-token (generous free tier)

If you need your own key:
1. Visit: https://ai.google.dev/gemini-api/docs
2. Click "Get API Key"
3. Sign in with your Google account
4. Create a new API key

---

### 3. FEC API ✅ **ALREADY CONFIGURED**

**What it's for:** Campaign finance data, lobbying activity, money flow

**Your key is already set up!** The existing key in `.env.local` is:
```bash
NEXT_PUBLIC_FEC_API_KEY=AvYhMl4E60WU02bdMZIHZr9NeGqnxAPWg1gpFhYR
```

**Rate Limit:** 1,000 requests/hour (with API key)
**Cost:** Free

---

### 4. OpenStates API (Optional)

**What it's for:** State-level legislation data

**Get your key:**
1. Visit: https://openstates.org/accounts/profile/
2. Create a free account
3. Copy your API key from your profile

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_OPENSTATES_API_KEY=your_openstates_api_key_here
```

**Rate Limit:** 1,000 requests/day (free tier)
**Cost:** Free tier available

**Note:** This is optional. The app primarily focuses on federal bills.

---

## Complete `.env.local` File

Your `.env.local` file should look like this:

```bash
# NewsAPI Configuration
NEXT_PUBLIC_NEWS_API_KEY=789250e1d1394ea7a5b21edba11f21e0

# Gemini AI Configuration ✅ CONFIGURED
GEMINI_API_KEY=AIzaSyBitqvBTLu2wK1uPUi_jJuG_Be7gfKwkPM
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyBitqvBTLu2wK1uPUi_jJuG_Be7gfKwkPM

# Congress.gov API Configuration ⚠️ YOU NEED TO ADD THIS
NEXT_PUBLIC_CONGRESS_API_KEY=your_congress_api_key_here

# OpenStates API Configuration (Optional)
NEXT_PUBLIC_OPENSTATES_API_KEY=your_openstates_api_key_here

# FEC API Configuration ✅ CONFIGURED
NEXT_PUBLIC_FEC_API_KEY=AvYhMl4E60WU02bdMZIHZr9NeGqnxAPWg1gpFhYR
```

---

## What You Need to Do

### ⚠️ ACTION REQUIRED: Congress.gov API Key

**This is the only API key you need to obtain!**

1. Go to: https://api.congress.gov/sign-up/
2. Enter your details
3. Check your email for the API key
4. Open `.env.local` in your project
5. Replace `your_congress_api_key_here` with your actual key
6. Save the file
7. Restart your dev server:
   ```bash
   npm run dev
   ```

**That's it!** The app will now work with real data.

---

## After Adding Your API Key

Once you've added your Congress.gov API key and restarted the server, you should see:

✅ **Trending Bills Widget** - Displays real federal bills with calculated engagement metrics
✅ **Polarizing Bills Widget** - Shows AI-analyzed bills with partisan breakdowns
✅ **Bill Detail Popup** - Complete bill information with:
   - Real voting records
   - AI truth scores and analysis
   - FEC campaign finance data
   - Monthly lobbying activity
   - Sponsor and cosponsor details

---

## Troubleshooting

### "Failed to load trending bills" error

**Solution:** You haven't added your Congress.gov API key yet.
- Follow the steps in "ACTION REQUIRED" above

### "API_KEY_INVALID" error

**Solution:** Your API key might be incorrect or the placeholder text is still there.
- Double-check you copied the full API key from the email
- Make sure there are no extra spaces
- Verify the key doesn't say `your_congress_api_key_here`

### Changes not taking effect

**Solution:** Restart the development server.
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Still seeing errors?

Check the browser console (F12 → Console tab) for specific error messages. The app will show helpful error states with instructions if API keys are missing.

---

## API Costs & Limits Summary

| API | Cost | Rate Limit | Required? |
|-----|------|-----------|-----------|
| Congress.gov | Free | 5,000/hour | ✅ Yes |
| Gemini AI | Free tier + Pay-per-token | Varies | ✅ Yes (already set up) |
| FEC | Free | 1,000/hour | ✅ Yes (already set up) |
| OpenStates | Free tier | 1,000/day | ❌ Optional |

**Total cost for basic usage: $0** (All use free tiers)

---

## Testing Your Setup

After adding your Congress.gov API key, visit the homepage and check:

1. **Trending Bills Widget** should display real bills
2. **Polarizing Bills Widget** should show analyzed bills
3. **Click on a bill** to open the detailed popup with all sections working

If you see real data instead of error messages, you're all set! 🎉

---

## Need Help?

If you're still having issues:

1. Check that `.env.local` is in the root of your project (same level as `package.json`)
2. Verify there are no typos in the environment variable names
3. Make sure you restarted the dev server after making changes
4. Check the console for specific error messages

---

**Last Updated:** 2025-10-04
