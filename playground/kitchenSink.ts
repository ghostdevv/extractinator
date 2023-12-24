/**
 * Represents a planet
 */
export interface Planet {
	/**
	 * The name of the planet
	 */
	name: string

	/**
	 * The Id for the Universe this planet belongs to
	 */
	universeId: string

	/**
	 * The location of the planet
	 */
	location: [x: number, y: number, z: number]

	/**
	 * Maths init
	 */
	delta: number
}

/**
 * Function to locate Raxacoricofallapatorius
 * @param universeId The Id for the Universe this planet belongs to
 */
export async function findRaxacoricofallapatorius(universeId: string) {
	return {} as Planet
}

/**
 * Do I need to say more?
 */
export default 'T.A.R.D.I.S.'

/**
 * A number called a
 */
const a = 10

/**
 * A number called b
 */
const b = 20

export { a, b as c }
export { b }

/**
 * The universe
 *
 * @example Infinite Void
 * ```ts
 * const universe = new Universe()
 * ```
 *
 * @example Big Bang
 * ```ts
 * const universe = new Universe([
 *   {
 *	    name: 'Earth',
 *		universeId: '42',
 *		location: [0, 0, 0],
 *		delta: 0,
 * 	 },
 *   // ...
 *  ])
 *
 * universe.explode()
 * ```
 */
export class Universe {
	constructor(
		/**
		 * The planets in the universe
		 * @default []
		 */
		public planets: Planet[] = [],
		/**
		 * If the universe should explode.
		 * @default false
		 */
		shouldExplode: boolean = false,
	) {
		if (shouldExplode) this.explode()
	}

	/**
	 * Explode the universe
	 */
	explode() {
		this.planets = []
	}
}
