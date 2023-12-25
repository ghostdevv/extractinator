/**
 * Whether the program is running in debug mode.
 *
 * @example
 * DEBUG=1 extractinator
 */
export const DEBUG_MODE = !!process.env['DEBUG']?.length
