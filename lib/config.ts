// Configuration file for API keys and other settings
// Add your NewsAPI key here
export const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || ''

// Add your Gemini API key here
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Add your LDA API key here
export const LDA_API_KEY = process.env.NEXT_PUBLIC_LDA_API_KEY || ''

// You can also add other configuration values here
export const CONFIG = {
  NEWS_API_KEY,
  GEMINI_API_KEY,
  LDA_API_KEY,
  // Add other config values as needed
}
