'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      const text = selection?.toString().trim()
      
      console.log('Text selected:', text)
      
      if (text && text.length > 0) {
        setSelectedText(text)
      } else {
        setSelectedText('')
      }
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('keyup', handleSelection)

    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('keyup', handleSelection)
    }
  }, [])

  // Speak the selected text
  const speak = useCallback(async (text?: string) => {
    const textToSpeak = text || selectedText

    console.log('Speak called with text:', textToSpeak)

    if (!textToSpeak || textToSpeak.trim().length === 0) {
      console.warn('No text to speak')
      return
    }

    try {
      setIsLoading(true)
      console.log('Calling TTS API...')

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }

      // Call the API to generate speech
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToSpeak }),
      })

      console.log('TTS API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('TTS API error:', errorData)
        throw new Error('Failed to generate speech')
      }

      // Create audio from the response
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onplay = () => setIsPlaying(true)
      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
      setIsLoading(false)
    } catch (error) {
      console.error('Text-to-speech error:', error)
      setIsLoading(false)
      setIsPlaying(false)
    }
  }, [selectedText])

  // Stop speaking
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setIsPlaying(false)
  }, [])

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    selectedText,
  }
}
