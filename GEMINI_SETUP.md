# Gemini API Setup for Real-Time Legislative Analysis

## Overview

The AI Analysis component now uses Google's Gemini API with Google Search grounding to provide real-time, up-to-date information about US Congressional activity from the past week. This ensures the analysis is based on current events rather than outdated information.

## Current Status

The system is currently running with **simulated grounding metadata** because the Gemini API key is not configured. You'll see mock data with example citations to demonstrate how the system works.

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the API key (it will look like: `AIzaSyC...`)

### 2. Configure the API Key

1. Open the `.env.local` file in your project root
2. Replace `your_gemini_api_key_here` with your actual API key:

```bash
# Gemini API Configuration
# Get your API key from https://ai.google.dev/
# Replace 'your_gemini_api_key_here' with your actual API key
GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here
```

### 3. Restart the Development Server

```bash
npm run dev
```

## What You'll Get With Real API Integration

### Real-Time Information
- **Current congressional news** from the past 7 days
- **Recent votes and outcomes** with actual dates
- **Committee hearings** and activities from this week
- **Bipartisan trends** based on current sessions

### Source Attribution
- **Clickable citations** linking to actual news sources
- **Search queries** showing what was researched
- **Source diversity** from multiple reputable outlets
- **Verifiable claims** with direct links

### Enhanced Features
- **Auto-refresh** every 30 minutes
- **Grounding metadata** showing search queries used
- **Citation system** with external link icons
- **Confidence scores** based on source reliability

## How Grounding Works

1. **User Request**: Component requests legislative analysis
2. **Gemini Analysis**: AI determines if real-time search is needed
3. **Google Search**: Gemini automatically searches for current information
4. **Response Processing**: AI synthesizes search results with analysis
5. **Citation Generation**: Grounding metadata links text to sources
6. **UI Rendering**: Component displays text with clickable citations

## API Endpoints

- `/api/gemini/analysis` - Main legislative analysis with grounding
- `/api/gemini/news` - Recent news summary with grounding
- `/api/gemini/analysis-legacy` - Fallback route with legacy grounding
- `/api/gemini/debug` - Debug endpoint to check API key status

## Troubleshooting

### Check API Key Status
Visit `http://localhost:3000/api/gemini/debug` to verify your API key is configured correctly.

### Common Issues
- **Mock data showing**: API key not configured or invalid
- **No citations**: Grounding not working, check API key
- **Error messages**: Check console logs for detailed error information

### Fallback System
The system includes multiple fallback mechanisms:
1. Primary route with new `googleSearch` tool
2. Legacy route with `googleSearchRetrieval` tool
3. Mock data with simulated grounding metadata
4. Error handling with graceful degradation

## Benefits of Real-Time Grounding

- **Increased Accuracy**: Reduces AI hallucinations by grounding in real data
- **Current Information**: Always up-to-date with recent congressional activity
- **Source Transparency**: Users can verify claims by clicking citations
- **Professional Quality**: Similar to academic citation systems

Once you configure the API key, the AI Analysis component will automatically switch to real-time data with proper grounding and citations!
