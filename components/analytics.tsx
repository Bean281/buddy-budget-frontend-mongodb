"use client"

import { useEffect } from 'react'

interface AnalyticsProps {
  trackingId?: string
  enableDevelopment?: boolean
}

export function Analytics({ 
  trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  enableDevelopment = false 
}: AnalyticsProps) {
  useEffect(() => {
    // Only run analytics in production or when explicitly enabled in development
    if (process.env.NODE_ENV !== 'production' && !enableDevelopment) {
      return
    }

    // Don't load if no tracking ID is provided
    if (!trackingId) {
      console.warn('Analytics: No tracking ID provided')
      return
    }

    // Load Google Analytics gtag script
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`
    document.head.appendChild(script1)

    // Initialize gtag
    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        page_title: document.title,
        page_location: window.location.href,
      });
    `
    document.head.appendChild(script2)

    // Track page views on route changes
    const handleRouteChange = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', trackingId, {
          page_title: document.title,
          page_location: window.location.href,
        })
      }
    }

    // Listen for route changes (for client-side navigation)
    window.addEventListener('popstate', handleRouteChange)

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
      // Remove scripts on unmount
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [trackingId, enableDevelopment])

  // Track custom events
  useEffect(() => {
    // Add gtag to window for global access
    if (typeof window !== 'undefined') {
      window.analytics = {
        track: (eventName: string, parameters?: Record<string, any>) => {
          if (window.gtag) {
            window.gtag('event', eventName, parameters)
          }
        },
        page: (pageName: string, parameters?: Record<string, any>) => {
          if (window.gtag) {
            window.gtag('config', trackingId, {
              page_title: pageName,
              ...parameters
            })
          }
        }
      }
    }
  }, [trackingId])

  return null // This component doesn't render anything
}

// Type declarations for global analytics
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
    analytics: {
      track: (eventName: string, parameters?: Record<string, any>) => void
      page: (pageName: string, parameters?: Record<string, any>) => void
    }
  }
}

export default Analytics
