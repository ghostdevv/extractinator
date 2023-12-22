import type { ExtractinatorOptions, ParsedFile } from './types'
import type { FileParserContext } from './files/files'

import { basename, extname, relative } from 'node:path'
import { l, b, n, o, g, r, d, bd } from './utils/log'
import { parseSvelteFile } from './files/svelte'
import { parseTSFile } from './files/typescript'
import { createTSDocParser } from './comments'
import { clean_temp } from './utils/temp'
import { Project } from 'ts-morph'
import { emit_dts } from './emit'

export async function extractinator(options: ExtractinatorOptions) {
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

	for (const source_file of project.getSourceFiles()) {
		const dts_path = source_file.getFilePath()
		const src_path = dts_file_map.get(dts_path)!

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

				l(o(file.componentName))

				file.props.length && l(' ', d(g(file.props.length)), d('Props'))
				file.slots.length && l(' ', d(g(file.slots.length)), d('Slots'))
				file.events.length && l(' ', d(g(file.events.length)), d('Events'))
				file.exports.length && l(' ', d(g(file.exports.length)), d('Exports'))

				total_components++
				total_exports += file.exports.length

				break
			}

			case is_ts: {
				const file = parseTSFile(ctx)
				parsed_files.push(file)

				l(b(file.fileName.replace('.ts', '')))

				const count = file.exports.length

				for (let i = 0; i < count; i++) {
					total_exports++

					const is_last = i === count - 1
					const branch_char = is_last ? ' └' : ' ├'

					const { name } = file.exports[i]

					l(g(branch_char), d(name))
				}

				total_modules++

				break
			}

			default:
				l(r(` ⤷ Skipped unknown file`))
				break
		}

		n()
	}

	l(d('cleaning up...'))
	await cleanup_dts()
	await clean_temp()

	n(2)
	l(bd('    Summary    '))
	l(d(' ─────────────'))

	l(o('components '), total_components)
	l(b(' modules   '), total_modules)
	l(d(' exports   '), total_exports)

	n()

	return parsed_files
}
