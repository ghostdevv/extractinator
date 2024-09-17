/**
 * Whether the program is running in debug mode.
 *
 * @example
 * DEBUG=1 extractinator
 */
export const DEBUG_MODE = !!process.env['DEBUG']?.length

/**
 * The program log level
 *
 * @example
 * DEBUG=1 extractinator
 */
export const LOG_LEVEL = process.env['LOG_LEVEL'] || 'info'
