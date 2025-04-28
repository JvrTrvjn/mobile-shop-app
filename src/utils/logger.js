/**
 * Utility for conditional logging based on environment
 * Only logs in development, silent in production
 */

// Check if we're in development environment
const isDev = process.env.NODE_ENV !== 'production'

/**
 * Logger utility that only outputs in development
 */
const logger = {
  log: (...args) => {
    if (isDev) {
      console.log(...args)
    }
  },
  
  info: (...args) => {
    if (isDev) {
      console.info(...args)
    }
  },
  
  warn: (...args) => {
    if (isDev) {
      console.warn(...args)
    }
  },
  
  error: (...args) => {
    // Errors are always logged, even in production
    // But could be sent to an error monitoring service instead
    console.error(...args)
  },
  
  debug: (...args) => {
    if (isDev) {
      console.debug(...args)
    }
  }
}

export default logger