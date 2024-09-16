import { b, d, l, lv, r, o, y, SEP } from './utils/log'
import { rm, copyFile, mkdir } from 'node:fs/promises'
import { relative, dirname } from 'node:path'
import { createRequire } from 'node:module'
import { get_temp_dir } from './utils/temp'
import { DEBUG_MODE } from './utils/env'
import { emitDts } from 'svelte2tsx'
import { existsSync } from 'node:fs'
import glob from 'tiny-glob'

const require = createRequire(import.meta.url)

function get_ext(path: string) {
	const guess = path.slice(path.lastIndexOf('.'))
	return ['.svelte', '.ts', '.d.ts'].includes(guess) ? guess : null
}

export async function emit_dts(input_dir: string) {
	//? Generate a unique TEMP_DIR for this instance of extractinator.
	const TEMP_DIR = await get_temp_dir(`dts-${Date.now()}`)

	lv(d(SEP + `Writing ${b('dts')} files to "${b(TEMP_DIR)}"\n`))

	//? Use svelte2tsx to generate the dts files for Svelte/TS/JS.
	await emitDts({
		svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
		//? Relative path for the output - abs path won't work here.
		declarationDir: relative(process.cwd(), TEMP_DIR),
		libRoot: input_dir,
	})

	// todo js files?
	const input_file_paths = await glob(`${input_dir}/**/*.{svelte,ts}`, {
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
		const input_ext = get_ext(input_path)

		if (!input_ext) {
			// This shouldn't happen
			l(r(`! Unable to handle "${input_path}", please report this bug`))
			continue
		}

		//? svelte2tsx doesn't generate dts files for d.ts files so we'll need to copy it across
		if (input_path.endsWith('.d.ts')) {
			const dest = input_path.replace(input_dir, TEMP_DIR)

			await mkdir(dirname(dest), { recursive: true })
			await copyFile(input_path, input_path.replace(input_dir, TEMP_DIR))
		}

		//? Construct the output path for the dts file.
		// e.g. /home/ghost/input/Test.svelte -> /home/ghost/output/Test.svelte.d.ts
		// e.g. /home/ghost/input/foo/test.ts -> /home/ghost/output/foo/test.d.ts
		// todo could collide if had foo.d.ts and foo.ts in same folder in source
		const dts_path = input_path
			.replace(input_dir, TEMP_DIR)
			.replace(/(\.d\.ts|\.ts)$/, '.d.ts')
			.replace(/\.svelte$/, '.svelte.d.ts')

		if (!existsSync(dts_path)) {
			lv(y('\nskipping file'), d(input_path))
			continue
		}

		dts_file_map.set(dts_path, input_path)
	}

	return {
		dts_file_map,
		async cleanup_dts() {
			if (DEBUG_MODE) {
				lv(o('skipping cleanup in debug mode'))
				return
			}
			lv(d('cleaning up dts...'))
			await rm(TEMP_DIR, { recursive: true, force: true })
		},
	}
}
