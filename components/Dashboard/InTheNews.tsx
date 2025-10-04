'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ExternalLink, Calendar, Newspaper } from 'lucide-react'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
}

interface InTheNewsProps {
  apiKey: string
}

export default function InTheNews({ apiKey }: InTheNewsProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      if (!apiKey) {
        setError('NewsAPI key is required')
        setLoading(false)
        return
      }

      try {
        // Search specifically for US Congress and federal legislation
        const searchTerms = '"United States Congress" OR "US Congress" OR "congressional bill" OR "federal legislation" OR "senate bill" OR "house bill" OR "congressional hearing" OR "senate vote" OR "house vote" OR "Capitol Hill" OR "congressional committee" OR "legislative session" OR "bill passage" OR "congressional debate" OR "Washington DC" OR "federal government"'
        const domains = 'politico.com,thehill.com,rollcall.com,congress.gov,senate.gov,house.gov'

        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchTerms)}&domains=${domains}&sortBy=publishedAt&pageSize=6&language=en&apiKey=${apiKey}`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.status === 'ok') {
          setArticles(data.articles || [])
        } else {
          throw new Error(data.message || 'Failed to fetch news')
        }
      } catch (err) {
        console.error('Error fetching news:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch news')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [apiKey])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-400/10">
              <Newspaper size={20} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">In the News</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-400/10">
              <Newspaper size={20} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">In the News</h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">Unable to load news articles</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-400/10">
            <Newspaper size={20} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">In the News</h2>
        </div>
        <div className="text-xs text-gray-400">
          Legislative & Political News
        </div>
      </div>

      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No recent legislative news found</p>
          </div>
        ) : (
          articles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors group"
            >
              <div className="flex space-x-4">
                {article.urlToImage && (
                  <div className="flex-shrink-0">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                      <span>{article.source.name}</span>
                    </div>
                    
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Read more</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}
