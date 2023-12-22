import { extname, relative, resolve } from 'node:path'
import { rm, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { get_temp_dir } from './utils/temp'
import { DEBUG_MODE } from './utils/env'
import { b, d, l } from './utils/log'
import { emitDts } from 'svelte2tsx'
import { existsSync } from 'node:fs'
import glob from 'tiny-glob'

const require = createRequire(import.meta.url)

export async function emit_dts(input: string) {
	//? Generate a unique TEMP_DIR for this instance of extractinator.
	const TEMP_DIR = await get_temp_dir(`dts-${Date.now()}`)

	l(d(`Writing ${b('dts')} files to "${b(TEMP_DIR)}"\n`))

	//? Use svelte2tsx to generate the dts files for Svelte/TS/JS.
	await emitDts({
		svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
		//? Relative path for the output - abs path won't work here.
		declarationDir: relative(process.cwd(), TEMP_DIR),
		libRoot: input,
	})

	// todo js files?
	const input_file_paths = await glob(`${input}/**/*.{svelte,ts}`, {
		filesOnly: true,
		absolute: true,
	})

	/**
	 * ```
	 * Map<dts_path, input_path>
	 * ```
	 */
	const dts_file_map = new Map<string, string>()

	for (const input_path of input_file_paths) {
		// todo more file types then gracefully ignore
		if (!['.svelte', '.ts'].includes(extname(input_path))) {
			throw new Error(`Unable to handle "${input_path}"`)
		}

		//? Construct the output path for the dts file.
		// e.g. /home/ghost/input/Test.svelte -> /home/ghost/output/Test.svelte.d.ts
		// e.g. /home/ghost/input/foo/test.ts -> /home/ghost/output/foo/test.d.ts

		const relative_path = relative(input, input_path)
		const input_ext = extname(relative_path)
		const output_ext = input_ext === '.svelte' ? '.svelte.d.ts' : '.d.ts'

		const dts_path = resolve(TEMP_DIR, relative_path.replace(input_ext, output_ext))

		if (!existsSync(dts_path)) {
			console.error({ dts_path, input_path })
			throw new Error(`Unable to find dts path for "${input_path}"`)
		}

		dts_file_map.set(dts_path, input_path)
	}

	return {
		dts_file_map,
		async cleanup_dts() {
			if (DEBUG_MODE) return
			await rm(TEMP_DIR, { recursive: true })
		},
	}
}
