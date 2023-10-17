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
 * @param {string} universeId The Id for the Universe this planet belongs to
 * @returns {Promise<Planet>}
 */
export async function findRaxacoricofallapatorius(universeId: string) {
	return {} as Planet
}
