import { rm, mkdir, readdir } from 'node:fs/promises'
import { resolve } from 'path'

/**
 * Create a temporary directory under ".extractinator" with the given name.
 * @returns The absolute path to the temp dir.
 */
export async function get_temp_dir(name: string) {
	const path = resolve(`.extractinator/${name}`)

	//? Cleanup the temp dir
	await rm(path, { force: true, recursive: true })
	await mkdir(path, { recursive: true })

	return path
}

export async function clean_temp() {
	const TEMP_ROOT = resolve('.extractinator')

	//? Remove the .extractinator dir if it's empty.
	if ((await readdir(TEMP_ROOT)).length == 0) {
		await rm(TEMP_ROOT, { recursive: true })
	}
}
