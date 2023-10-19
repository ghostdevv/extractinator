import { relative, resolve } from 'node:path'
import { rm, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { emitDts } from 'svelte2tsx'

const require = createRequire(import.meta.url)

const TEMP_DIR = resolve('.extractinator/dts')

export async function emit(input: string) {
	//? Cleanup & Create the TEMP_DIR
	await rm(TEMP_DIR, { force: true, recursive: true })
	await mkdir(TEMP_DIR, { recursive: true })

	//? Use svelte2tsx to generate the dts files for Svelte/TS/JS
	await emitDts({
		//? Path to Shims
		svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
		//? Relative path for the output, abs path won't work here
		declarationDir: relative(process.cwd(), TEMP_DIR),
		//? Input
		libRoot: input,
	})

	return {
		location: TEMP_DIR,
	}
}
