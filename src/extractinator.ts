import type { ExtractinatorOptions, ParsedFile } from './types'
import type { FileParserContext } from './files/files'

import { l, lv, b, n, nv, o, r, d, bd, logSvelteFile, logTsFile } from './utils/log'
import { basename, extname, relative } from 'node:path'
import { parseSvelteFile } from './files/svelte'
import { parseTSFile } from './files/typescript'
import { createTSDocParser } from './comments'
import { clean_temp } from './utils/temp'
import { Project } from 'ts-morph'
import { emit_dts } from './emit'

export async function extractinator(options: ExtractinatorOptions) {
	console.clear() //! DELETEME
	//? ts-morph project
	const project = new Project()

	const { dts_file_map, cleanup_dts } = await emit_dts(options.input)

	//? Load all the generated .d.ts files
	for (const dts_path of dts_file_map.keys()) {
		project.addSourceFileAtPath(dts_path)
	}

	const tsdoc = createTSDocParser(options.tsdocConfigPath)

	const parsed_files: ParsedFile[] = []

	let total_exports = 0
	let total_modules = 0
	let total_components = 0

	nv()

	for (const source_file of project.getSourceFiles()) {
		const dts_path = source_file.getFilePath()
		const src_path = dts_file_map.get(dts_path)

		if (!src_path) throw new Error(`Unable to find source file for "${dts_path}"`)

		const is_svelte = extname(src_path) === '.svelte'
		const is_ts = extname(src_path) === '.ts'

		const ctx: FileParserContext = {
			file_name: basename(src_path),
			input_file_path: relative(process.cwd(), src_path),
			file: source_file,
			tsdoc,
		}

		switch (true) {
			case is_svelte: {
				const file = parseSvelteFile(ctx)
				parsed_files.push(file)

				logSvelteFile(file)
				total_components++
				total_exports += file.exports.length

				break
			}

			case is_ts: {
				const file = parseTSFile(ctx)
				parsed_files.push(file)

				logTsFile(file)
				total_exports += parsed_files.length
				total_modules++

				break
			}

			default:
				lv(r(` ⤷ Skipped unknown file`))
				break
		}

		nv()
	}

	await cleanup_dts()
	await clean_temp()

	nv(1)
	n()

	l(bd('   Extracted   '))
	l(d(' ─────────────'))

	l(o(' components '), total_components)
	l(b(' modules    '), total_modules)
	l(d(' exports    '), total_exports)

	n()

	return parsed_files
}
