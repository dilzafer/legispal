'use client'

import { useTextToSpeech } from '@/lib/hooks/useTextToSpeech'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export default function FloatingTTSButton() {
  const { speak, stop, isPlaying, isLoading, selectedText } = useTextToSpeech()

  useEffect(() => {
    console.log('TTS Button - Selected text:', selectedText)
    console.log('TTS Button - Is playing:', isPlaying)
    console.log('TTS Button - Is loading:', isLoading)
  }, [selectedText, isPlaying, isLoading])

  const handleClick = () => {
    if (isPlaying) {
      stop()
    } else {
      speak()
    }
  }

  return (
    <AnimatePresence>
      {selectedText && selectedText.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
          disabled={isLoading}
          className="fixed bottom-8 right-8 z-50 bg-truth-green hover:bg-truth-green/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          title={isPlaying ? 'Stop reading' : 'Read selected text'}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : isPlaying ? (
            <VolumeX size={24} />
          ) : (
            <Volume2 size={24} />
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isPlaying ? 'Stop reading' : 'Read selected text'}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
