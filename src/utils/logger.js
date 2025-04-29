const isDev = process.env.NODE_ENV !== 'production'

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
    console.error(...args)
  },

  debug: (...args) => {
    if (isDev) {
      console.debug(...args)
    }
  },
}

export default logger
