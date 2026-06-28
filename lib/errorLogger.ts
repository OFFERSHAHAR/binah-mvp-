/**
 * Error logging service for centralized error tracking
 * Logs to console in development and can be extended for external error tracking (Sentry, LogRocket, etc.)
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorCategory = 'auth' | 'network' | 'data' | 'component' | 'validation' | 'unknown'

interface LogErrorOptions {
  severity?: ErrorSeverity
  category?: ErrorCategory
  context?: Record<string, unknown>
  stack?: string
  timestamp?: Date
  userId?: string
  sessionId?: string
}

interface ErrorLog {
  id: string
  message: string
  severity: ErrorSeverity
  category: ErrorCategory
  context: Record<string, unknown>
  stack?: string
  timestamp: Date
  userId?: string
  sessionId?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100

  /**
   * Log an error with metadata
   */
  logError(error: Error | string, options: LogErrorOptions = {}): ErrorLog {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      message: typeof error === 'string' ? error : error.message,
      severity: options.severity || 'medium',
      category: options.category || 'unknown',
      context: options.context || {},
      stack: options.stack || (error instanceof Error ? error.stack : undefined),
      timestamp: options.timestamp || new Date(),
      userId: options.userId,
      sessionId: options.sessionId,
    }

    this.logs.push(errorLog)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(errorLog)
    }

    // Send to external service if configured
    this.sendToExternalService(errorLog)

    // Dispatch custom event for error tracking
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app-error-logged', {
          detail: errorLog,
        })
      )
    }

    return errorLog
  }

  /**
   * Log an authentication error
   */
  logAuthError(message: string, context?: Record<string, unknown>): ErrorLog {
    return this.logError(message, {
      severity: 'high',
      category: 'auth',
      context,
    })
  }

  /**
   * Log a network error
   */
  logNetworkError(message: string, statusCode?: number, context?: Record<string, unknown>): ErrorLog {
    return this.logError(message, {
      severity: statusCode === 503 ? 'medium' : statusCode && statusCode >= 500 ? 'high' : 'medium',
      category: 'network',
      context: { statusCode, ...context },
    })
  }

  /**
   * Log a data fetch error
   */
  logDataError(message: string, endpoint?: string, context?: Record<string, unknown>): ErrorLog {
    return this.logError(message, {
      severity: 'high',
      category: 'data',
      context: { endpoint, ...context },
    })
  }

  /**
   * Log a validation error
   */
  logValidationError(message: string, field?: string, context?: Record<string, unknown>): ErrorLog {
    return this.logError(message, {
      severity: 'low',
      category: 'validation',
      context: { field, ...context },
    })
  }

  /**
   * Log a component error (for Error Boundary)
   */
  logComponentError(error: Error, componentStack?: string, context?: Record<string, unknown>): ErrorLog {
    return this.logError(error, {
      severity: 'high',
      category: 'component',
      stack: componentStack,
      context,
    })
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): ErrorLog[] {
    return this.logs.filter((log) => log.category === category)
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): ErrorLog[] {
    return this.logs.filter((log) => log.severity === severity)
  }

  /**
   * Get recent errors (last N)
   */
  getRecentErrors(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Log to console (development)
   */
  private logToConsole(errorLog: ErrorLog): void {
    const style = this.getSeverityStyle(errorLog.severity)
    console.group(`%c[${errorLog.severity.toUpperCase()}] ${errorLog.category.toUpperCase()}`, style)
    console.error(`${errorLog.message}`)
    const tableData = {
      'Error ID': errorLog.id,
      'Timestamp': errorLog.timestamp.toISOString(),
      'Category': errorLog.category,
      'Severity': errorLog.severity,
    }
    console.table(tableData)

    if (Object.keys(errorLog.context).length > 0) {
      console.log('Context:', errorLog.context)
    }

    if (errorLog.stack) {
      console.error('Stack:', errorLog.stack)
    }

    console.groupEnd()
  }

  /**
   * Get console styling for severity
   */
  private getSeverityStyle(severity: ErrorSeverity): string {
    const styles: Record<ErrorSeverity, string> = {
      low: 'color: #3b82f6; font-weight: bold; background: #dbeafe; padding: 2px 4px; border-radius: 3px;',
      medium: 'color: #f59e0b; font-weight: bold; background: #fef3c7; padding: 2px 4px; border-radius: 3px;',
      high: 'color: #ef4444; font-weight: bold; background: #fee2e2; padding: 2px 4px; border-radius: 3px;',
      critical: 'color: #991b1b; font-weight: bold; background: #fecaca; padding: 2px 4px; border-radius: 3px;',
    }
    return styles[severity]
  }

  /**
   * Send to external service (Sentry, LogRocket, etc.)
   */
  private sendToExternalService(errorLog: ErrorLog): void {
    // This is where you'd integrate with external error tracking services
    // Example: Sentry.captureException(error, { level: errorLog.severity })

    // For now, we dispatch a custom event that can be listened to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('error-logger-external-send', {
          detail: errorLog,
        })
      )
    }
  }

  /**
   * Generate unique ID for each error log
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()

// Export for external tracking integration
export const setupExternalErrorTracking = (callback: (errorLog: ErrorLog) => void): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error-logger-external-send', ((event: CustomEvent) => {
      callback(event.detail)
    }) as EventListener)
  }
}
