# Troubleshooting Guide

## 🔍 Problem: Nothing Shows Up Under Trending Bills or Polarizing Bills

### Root Cause Analysis

The widgets are empty because:

1. **Missing Congress.gov API Key** ⚠️
   - The `.env.local` file has a placeholder: `your_congress_api_key_here`
   - This placeholder is being rejected by the validation logic
   - API returns empty array `[]` instead of making invalid requests
   - Empty array results in no bills to display

2. **How the Data Flow Works:**
   ```
   Component Loads → Calls API → Checks API Key →
   Invalid/Missing? → Returns [] → bills.length === 0 → Shows Empty State
   ```

### ✅ Solution

**You need a real Congress.gov API key!**

#### Step 1: Get Your Free API Key
1. Visit: https://api.congress.gov/sign-up/
2. Fill in:
   - Name
   - Email address
   - Organization (can be "Personal Project")
3. Submit the form
4. **Check your email** - you'll receive the API key instantly

#### Step 2: Add to .env.local
Open `.env.local` in the project root and replace the placeholder:

**Before:**
```bash
NEXT_PUBLIC_CONGRESS_API_KEY=your_congress_api_key_here
```

**After:**
```bash
NEXT_PUBLIC_CONGRESS_API_KEY=AbCdEf123456YourActualKeyHere
```

#### Step 3: Restart the Dev Server
```bash
# Stop the current server (Ctrl+C or Cmd+C)
npm run dev
```

#### Step 4: Verify It Works
After restart, you should see:
- ✅ **Trending Bills** widget populated with real bills
- ✅ **Polarizing Bills** widget showing AI-analyzed legislation
- ✅ Console logs: `✅ Fetched X bills from Congress API`

---

## 🐛 Other Common Issues

### Issue: "API_KEY_INVALID" Error in Console

**Symptoms:**
```
❌ Congress API error: 403
Error details: "API_KEY_INVALID"
```

**Causes:**
1. API key is still the placeholder text
2. API key has typos or extra spaces
3. API key is incomplete (cut off during copy/paste)

**Solution:**
1. Double-check your API key in `.env.local`
2. Make sure there are NO spaces before or after the key
3. Verify the key matches exactly what was in the email
4. Try copying the key again from the email

---

### Issue: Changes Not Taking Effect

**Symptoms:**
- Added API key but widgets still empty
- Still seeing placeholder errors

**Solution:**
Environment variables are loaded at server start. You MUST restart:
```bash
# Stop the server
# Then restart
npm run dev
```

**Pro Tip:** Some developers run `rm -rf .next` before restarting to clear Next.js cache.

---

### Issue: "Failed to load trending bills" Error

**Symptoms:**
- Red error message in widget
- Console shows network errors

**Possible Causes:**
1. Congress.gov API is down (rare)
2. Network connectivity issues
3. Rate limit exceeded (5000 requests/hour)

**Solution:**
1. Check your internet connection
2. Wait a few minutes and refresh
3. Check Congress.gov API status
4. If using heavily, wait for rate limit reset

---

### Issue: Bills Load But Show "Click to load AI analysis"

**Symptoms:**
- Bills display but details are minimal
- Popup shows placeholder text

**This is actually normal!**

**Why:**
- For performance, we load bills quickly WITHOUT AI analysis first
- Full AI analysis with Gemini happens when you click on a bill
- This keeps the initial page load fast

**If AI analysis fails:**
- Check `NEXT_PUBLIC_GEMINI_API_KEY` is set correctly
- Gemini API key is already configured in the repo ✅
- Check browser console for specific Gemini errors

---

### Issue: Sankey Chart "key" prop Warning

**Symptoms:**
```
Warning: Each child in a list should have a unique "key" prop.
```

**This is a harmless warning** from the Recharts library's Sankey component. It doesn't affect functionality. The warning comes from an internal component and can be safely ignored.

---

### Issue: HTTP 500 Error from Gemini

**Symptoms:**
```
HTTP error! status: 500
at getLegislativeAnalysis
```

**Possible Causes:**
1. Gemini API quota exceeded
2. Gemini API key invalid
3. Bill text too long for API

**Solution:**
1. Check Gemini API quota at: https://aistudio.google.com/
2. Verify `NEXT_PUBLIC_GEMINI_API_KEY` is correct
3. This is usually temporary - refresh and try another bill

---

## 🔧 Advanced Debugging

### Check What's Actually Loaded

Open browser console (F12 → Console) and look for:

**Good Signs:**
```
✅ Fetched 20 bills from Congress API
✅ Returning 5 trending bills from real API data
✅ Transformed 3 bills
```

**Bad Signs:**
```
⚠️  Congress API key not configured
❌ Congress API error: 403
No bills from Congress API
```

### Verify Environment Variables

In your browser console:
```javascript
console.log(process.env.NEXT_PUBLIC_CONGRESS_API_KEY)
```

**Note:** This only works in client components. If it shows `undefined`, your `.env.local` isn't being loaded.

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for requests to `api.congress.gov`
5. Click on a request to see:
   - Request headers
   - Response status
   - Response body

**What to look for:**
- ✅ Status 200: Success!
- ❌ Status 403: Invalid API key
- ❌ Status 429: Rate limit exceeded
- ❌ Status 500: Server error

---

## 📊 Understanding the Empty States

The app now shows helpful empty states with instructions:

### When You See This:
```
⚠️ No bills loaded
This usually means the Congress.gov API key is missing or invalid.

Quick Fix:
1. Get your free API key at api.congress.gov/sign-up
2. Add to .env.local: NEXT_PUBLIC_CONGRESS_API_KEY=your_key
3. Restart: npm run dev
```

**This means:** The API key validation detected a placeholder or missing key and returned an empty array to prevent invalid API calls.

---

## 🎯 Quick Checklist

Before asking for help, verify:

- [ ] `.env.local` exists in project root (same level as `package.json`)
- [ ] `NEXT_PUBLIC_CONGRESS_API_KEY` is set to a real key (not placeholder)
- [ ] No typos or extra spaces in the API key
- [ ] Dev server was restarted after adding the key
- [ ] Browser was refreshed after server restart
- [ ] Console shows no 403 errors
- [ ] Internet connection is working

---

## 🆘 Still Having Issues?

### Collect This Information:

1. **Console Errors** (F12 → Console tab)
   - Copy any red error messages

2. **Network Errors** (F12 → Network tab)
   - Filter by "congress.gov"
   - Check response status and body

3. **Environment Check**
   ```bash
   cat .env.local | grep CONGRESS
   ```
   Output should show your real API key, not placeholder

4. **Next.js Version**
   ```bash
   npm list next
   ```

### Then:

1. Check the GitHub issues: https://github.com/your-repo/issues
2. Post a new issue with the information above
3. Include screenshots of the empty state

---

## ✅ Success Indicators

You'll know everything is working when:

1. **Trending Bills Widget:**
   - Shows 3-5 real federal bills
   - Each has a bill number (e.g., "H.R.2024")
   - Trend scores are displayed
   - Controversy levels shown

2. **Polarizing Bills Widget:**
   - Shows 3 bills with high partisan divide
   - Partisan meter displays Democrat/Republican percentages
   - "Left View" and "Right View" debate points shown

3. **Console Logs:**
   ```
   ✅ Fetched 20 bills from Congress API
   ✅ Returning 5 trending bills from real API data
   ✅ Transformed 3 bills
   ```

4. **When You Click a Bill:**
   - Popup opens with full details
   - All sections are populated
   - AI analysis loads (may take a few seconds)

---

**Last Updated:** 2025-10-04
**For More Help:** See [API_SETUP_GUIDE.md](API_SETUP_GUIDE.md)
