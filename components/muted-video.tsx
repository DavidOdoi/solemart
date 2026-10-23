'use client'

import { useEffect, useRef, useState } from 'react'

type VideoPlayer = {
  mute: () => void
  playVideo: () => void
  pauseVideo: () => void
  destroy: () => void
}

type YouTubeAPI = {
  Player: new (element: HTMLElement, options: {
    videoId: string
    host: string
    playerVars: Record<string, string | number>
    events: {
      onReady: (event: { target: VideoPlayer }) => void
      onError: (event: { target: VideoPlayer }) => void
    }
  }) => VideoPlayer
}

let youtubeReady: Promise<YouTubeAPI> | undefined

function loadYouTube() {
  if (!youtubeReady) {
    youtubeReady = new Promise<YouTubeAPI>((resolve, reject) => {
      const apiWindow = window as typeof window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void }
      if (apiWindow.YT?.Player) return resolve(apiWindow.YT)
      const previousReady = apiWindow.onYouTubeIframeAPIReady
      apiWindow.onYouTubeIframeAPIReady = () => {
        previousReady?.()
        if (apiWindow.YT) resolve(apiWindow.YT)
      }
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.onerror = () => reject(new Error('Video highlights unavailable'))
      document.head.appendChild(script)
    })
  }
  return youtubeReady
}

export default function MutedVideo({ id, playing }: { id: string; playing: boolean }) {
  const container = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(playing)
  const player = useRef<VideoPlayer | null>(null)
  const shouldPlay = useRef(playing)
  shouldPlay.current = playing

  useEffect(() => {
    if (playing) setEnabled(true)
  }, [playing])

  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let instance: VideoPlayer | undefined
    loadYouTube().then((api) => {
      if (disposed || !container.current) return
      const host = document.createElement('div')
      container.current.appendChild(host)
      instance = new api.Player(host, {
        host: 'https://www.youtube-nocookie.com',
        videoId: id,
        playerVars: { autoplay: 0, mute: 1, controls: 0, disablekb: 1, playsinline: 1, loop: 1, playlist: id, rel: 0, origin: window.location.origin },
        events: {
          onReady: ({ target }) => {
            if (disposed) return
            player.current = target
            target.mute()
            if (shouldPlay.current) target.playVideo()
            const iframe = container.current?.querySelector('iframe')
            iframe?.setAttribute('tabindex', '-1')
            iframe?.setAttribute('title', 'Muted shoe video highlight')
          },
          onError: () => {
            player.current = null
            instance?.destroy()
            instance = undefined
            container.current?.replaceChildren()
          },
        },
      })
    }).catch(() => { /* Keep the slide's poster visible when embeds are unavailable. */ })
    return () => {
      disposed = true
      player.current = null
      instance?.destroy()
      container.current?.replaceChildren()
    }
  }, [id, enabled])

  useEffect(() => {
    player.current?.mute()
    if (playing) player.current?.playVideo()
    else player.current?.pauseVideo()
  }, [playing])

  return <div ref={container} aria-hidden="true" className="hero-slider__video" />
}

