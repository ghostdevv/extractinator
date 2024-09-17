/**
 * Adds two or three numbers together.
 * @param a The first number to add.
 * @param b The second number to add.
 * @returns The sum of the two numbers.
 */
export function add(a: number, b: number): number

/**
 * Adds two or three numbers together.
 * @param a The first number to add.
 * @param b The second number to add.
 * @param c The third number to add.
 * @returns The sum of the three numbers.
 */
export function add(a: number, b: number, c: number): number

/**
 * Adds two or three numbers together.
 * @param a The first number to add.
 * @param b The second number to add.
 * @param c Optional third number to add.
 * @returns The sum of the input numbers.
 */
export function add(a: number, b: number, c?: number): number {
	return a + b + (c ?? 0)
}
