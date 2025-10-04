# API Integration Documentation

This document describes the comprehensive API integration for the Oversight USA legislative tracking system, combining Congress.gov API, OpenStates API, and Google's Gemini AI with grounding for real-time bill analysis.

## 🚀 Overview

The application integrates three major APIs to provide comprehensive legislative tracking:

1. **Congress.gov API** - Federal legislative data (bills, votes, sponsors, actions)
2. **OpenStates API** - State-level legislative data
3. **Google Gemini AI** - AI-powered bill analysis with Google Search grounding for factual accuracy

## 📋 API Configuration

### Environment Variables

Configure these in your `.env.local` file:

```env
# Gemini AI Configuration (REQUIRED)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
Gemini_API_key=your_gemini_api_key_here

# NewsAPI Configuration (for "In the News" widget)
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key_here

# OpenStates API (optional - for state bills)
NEXT_PUBLIC_OPENSTATES_API_KEY=your_openstates_key_here

# Congress.gov API (optional - publicly accessible)
NEXT_PUBLIC_CONGRESS_API_KEY=your_congress_key_here
```

### Getting API Keys

#### 1. Gemini AI API Key (Required)
- Visit: https://ai.google.dev/
- Sign in with Google account
- Navigate to "Get API Key"
- Create a new API key
- Copy and paste into `.env.local`

**Note:** Gemini AI is used for:
- Bill analysis and truth scoring
- Fact-checking with Google Search grounding
- Public sentiment analysis
- Polarization analysis
- Generating bill summaries

#### 2. Congress.gov API Key (Optional)
- Visit: https://api.congress.gov/sign-up/
- Register for an API key
- Congress.gov provides federal bill data

**Note:** The Congress API is publicly accessible but registration is recommended for higher rate limits.

#### 3. OpenStates API Key (Optional)
- Visit: https://openstates.org/accounts/profile/
- Create an account
- Generate an API key

**Note:** OpenStates provides state-level legislative data.

#### 4. NewsAPI Key
- Visit: https://newsapi.org/
- Register for a free account
- Get your API key

## 🏗️ Architecture

### File Structure

```
lib/
├── api/
│   ├── congress.ts          # Congress.gov API integration
│   ├── openstates.ts        # OpenStates API integration
│   └── gemini.ts            # Gemini AI integration
├── services/
│   └── billService.ts       # Unified bill data service
└── useBillDashboard.tsx     # React context for bill data
```

### Data Flow

1. **Trending Bills Widget**
   ```
   User visits dashboard
   → getTrendingBills() in billService.ts
   → Fetches recent bills from Congress API
   → Calculates trend scores
   → Analyzes top bills with Gemini AI
   → Returns enriched bill data
   → Displays in TrendingBills component
   ```

2. **Polarizing Bills Widget**
   ```
   User visits dashboard
   → getPolarizingBills() in billService.ts
   → Fetches recent bills from Congress API
   → Uses Gemini AI to analyze polarization
   → Calculates partisan support percentages
   → Returns bills with highest divide
   → Displays in PolarizingBills component
   ```

3. **Bill Detail Popup**
   ```
   User clicks on bill
   → openBillDashboard(billId) in useBillDashboard
   → getCompleteBillData() in billService.ts
   → Fetches full bill details from Congress API
   → Fetches vote records
   → Fetches cosponsors
   → Analyzes with Gemini AI (truth score, provisions, etc.)
   → Combines all data into BillData object
   → Displays in BillDashboard popup
   ```

## 🧠 Gemini AI Integration

### Features

The Gemini AI integration uses **Gemini 2.0 Flash Experimental** with **Google Search grounding** to provide:

#### 1. Truth Score (0-100)
- Factual accuracy of bill claims (40%)
- Transparency of bill language (30%)
- Evidence quality (30%)

#### 2. AI Confidence (0-100)
- Quality and quantity of data available
- Consistency of sources
- Recency of information

#### 3. Key Provisions
- Main provisions of the bill
- Extracted from bill text and analysis

#### 4. Hidden Implications
- Non-obvious consequences
- Potential conflicts with existing law
- Implementation challenges

#### 5. Fact Check Analysis
- Verification of claims in bill
- Percentage confidence per claim
- Color-coded by verification level:
  - Green (#10b981): Verified
  - Yellow (#f59e0b): Uncertain
  - Red (#ef4444): Disputed

#### 6. Public Sentiment
- Democrat support percentage
- Republican support percentage
- Arguments for and against
- Based on actual polling data and Google Search results

#### 7. Impact Analysis
- Fiscal note
- Beneficiaries
- Payers
- Economic impact

### Prompt Engineering

The Gemini AI prompts are carefully designed to:
1. Use Google Search grounding for factual accuracy
2. Request structured JSON responses
3. Specify exact data formats
4. Emphasize factual analysis over speculation
5. Request recent data through search

Example prompt structure:
```
You are an expert legislative analyst. Analyze the following US bill
and provide a comprehensive, factual assessment. Use Google Search to
find recent news, voting records, and public opinion data about this bill.

[Bill details]

Return JSON with: truth score, key provisions, fact checks, etc.

IMPORTANT:
1. Use Google Search to find the most recent and accurate information
2. Base your analysis on factual data, not speculation
3. Truth score should reflect: factual accuracy (40%), transparency (30%), evidence quality (30%)
```

### Temperature Settings

- **Bill Analysis**: 0.4 (lower for more factual responses)
- **Summary Generation**: 0.3 (very low for concise, factual summaries)
- **Polarization Analysis**: 0.4 (balanced for analytical tasks)

## 📊 Congress.gov API Integration

### Endpoints Used

1. **List Bills**: `/v3/bill/{congress}`
   - Fetches recent bills for current congress
   - Supports pagination

2. **Bill Details**: `/v3/bill/{congress}/{type}/{number}`
   - Detailed information about specific bill
   - Includes summaries, subjects, sponsors

3. **Bill Actions**: `/v3/bill/{congress}/{type}/{number}/actions`
   - Legislative history
   - Status updates

4. **Bill Cosponsors**: `/v3/bill/{congress}/{type}/{number}/cosponsors`
   - List of cosponsors with party affiliation

5. **Vote Details**: `/v3/vote/{congress}/{chamber}/{roll}`
   - Detailed vote results
   - Party breakdown

### Data Processing

#### Trend Score Calculation
```typescript
score = 50 (base)
+ 30 if updated < 7 days ago
+ 15 if updated < 30 days ago
+ min(cosponsors, 20) for cosponsor count
= max score of 100
```

#### Controversy Level
```typescript
diff = abs(democratSupport - republicanSupport)
if diff > 60: 'high'
if diff > 30: 'medium'
else: 'low'
```

#### Bill Status Determination
Parsed from latest action text:
- "became public law" → Enacted
- "passed senate" → Passed Senate
- "passed house" → Passed House
- "committee" → Committee
- "introduced" → Introduced

## 🏛️ OpenStates API Integration

### Purpose
Provides state-level legislative data to complement federal bills.

### Endpoints Used

1. **List Bills**: `/bills`
   - State bills with filters
   - Pagination support

2. **Bill Details**: `/bills/{id}`
   - Full bill information
   - Sponsorships and actions

3. **Votes**: `/bills/{id}/votes`
   - State-level vote records

### State Trend Score
Similar to federal calculation but adjusted for state-level activity patterns.

## 🔄 Data Caching Strategy

### Next.js Revalidation
All API calls use Next.js caching with 1-hour revalidation:

```typescript
fetch(url, {
  next: { revalidate: 3600 } // 1 hour cache
})
```

This balances:
- Fresh data for users
- Reduced API calls
- Faster page loads

## ⚡ Performance Optimizations

### 1. Fallback to Mock Data
The system gracefully falls back to mock data if APIs are unavailable:
```typescript
// Check mock data first for fast loading
if (mockBillData[selectedBillId]) {
  return mockBillData[selectedBillId]
}

// Then fetch from APIs
const billData = await getCompleteBillData(...)
```

### 2. Progressive Loading
- Show loading states immediately
- Display cached/mock data first
- Enhance with AI analysis asynchronously

### 3. Parallel API Calls
Multiple independent API calls are made in parallel:
```typescript
const [bills, stateBills] = await Promise.all([
  fetchRecentBills(limit),
  fetchStateBills(limit)
])
```

## 🧪 Testing the Integration

### 1. Test Trending Bills
1. Visit the dashboard
2. Observe the "Trending Bills" widget
3. Should show real federal bills with AI analysis
4. Loading state should appear briefly

### 2. Test Polarizing Bills
1. Check the "Polarizing Bills" widget
2. Should show bills with significant partisan divide
3. Partisan meter should animate

### 3. Test Bill Detail Popup
1. Click any bill in trending or polarizing widgets
2. Popup should open with loading spinner
3. Full bill details should load including:
   - Truth score (with AI analysis)
   - Vote results (if available)
   - Key provisions (from Gemini AI)
   - Public sentiment analysis
   - Fact checks

### 4. Verify Gemini Integration
Check browser console for Gemini API responses:
```javascript
// Should see logs like:
"Analyzing bill with Gemini..."
"Gemini analysis received: {...}"
```

## 🐛 Troubleshooting

### Gemini API Errors

**Error: "API key not found"**
- Check `.env.local` has `NEXT_PUBLIC_GEMINI_API_KEY`
- Restart Next.js dev server after adding env variables

**Error: "SAFETY" or blocked response**
- Gemini's safety filters may block political content
- This is a limitation of the free tier
- Try rephrasing bill titles/content

**Error: Rate limit exceeded**
- Free tier has limits (60 requests/minute, 1500/day)
- Implement request queuing or upgrade to paid tier

### Congress API Errors

**Error: 404 Not Found**
- Congress number may be incorrect (currently 118)
- Bill type/number format may be wrong (e.g., "hr" not "HR")

**Error: CORS issues**
- Congress API should be called server-side only
- Use in API routes or server components

### OpenStates API Errors

**Error: Authentication failed**
- OpenStates requires API key for most requests
- Add `NEXT_PUBLIC_OPENSTATES_API_KEY` to `.env.local`

## 📈 Rate Limits

### Gemini AI
- **Free Tier**: 60 requests/minute, 1,500 requests/day
- **Mitigation**: Cache AI results, batch requests

### Congress.gov
- **Public**: Unspecified, be respectful
- **With API Key**: Higher limits

### OpenStates
- **Free Tier**: 5,000 requests/day
- **Paid**: Higher limits available

## 🔐 Security Notes

1. **API Keys in Environment**
   - Never commit `.env.local` to git
   - Use `NEXT_PUBLIC_` prefix only for client-safe keys
   - Gemini key is exposed client-side (acceptable for this use)

2. **Data Privacy**
   - No personal user data sent to APIs
   - Only public legislative data is processed

3. **Rate Limiting**
   - Implement client-side debouncing
   - Use caching to reduce API calls

## 🚦 Next Steps

### Recommended Enhancements

1. **Add Request Caching**
   - Implement Redis or in-memory cache
   - Store AI analysis results

2. **Implement Webhooks**
   - Subscribe to Congress.gov updates
   - Real-time bill notifications

3. **Enhanced Error Handling**
   - Retry logic for failed API calls
   - User-friendly error messages

4. **Analytics**
   - Track API usage
   - Monitor Gemini AI quality

5. **Expand State Coverage**
   - Fully integrate OpenStates
   - Add state bill tracking

## 📞 Support

For issues with:
- **Congress.gov API**: https://api.congress.gov/support/
- **OpenStates API**: https://openstates.org/support/
- **Gemini AI**: https://ai.google.dev/support/

## 📝 License

This integration follows the respective API terms of service:
- Congress.gov: Public domain
- OpenStates: CC BY-SA 4.0
- Gemini AI: Google AI Terms of Service
