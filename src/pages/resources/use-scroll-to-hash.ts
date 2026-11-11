import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Brings the heading named in the address into view (search results and shared links point at headings). */
export function useScrollToHash() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(decodeURIComponent(hash.slice(1)))
    el?.scrollIntoView({ block: 'start' })
  }, [hash])
}
