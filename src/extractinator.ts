import type { ExtractinatorOptions, ParsedFile } from './types'
import type { FileParserContext } from './files/files'

import { l, b, n, o, g, r, dim } from './utils/log'
import { parseSvelteFile } from './files/svelte'
import { parseTSFile } from './files/typescript'
import { createTSDocParser } from './comments'
import { basename } from 'node:path'
import { Project } from 'ts-morph'
import { emit_dts } from './emit'

export async function extractinator(options: ExtractinatorOptions) {
	//? ts-morph project
	const project = new Project()

	const dts = await emit_dts(options.input)

	//? Load all the generated .d.ts files
	for (const dts_path of dts.dts_file_map.keys()) {
		project.addSourceFileAtPath(dts_path)
	}

	const tsdoc = createTSDocParser(options.tsdocConfigPath)

	//? Parsed Svelte/TS Files
	const parsed_files: ParsedFile[] = []

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

		switch (ext) {
			//? Handle Svelte Files
			case '.svelte.d.ts': {
				const file = parseSvelteFile(ctx)
				parsed_files.push(file)

				l(' ⤷', o(file.componentName))
				l('  ', dim('Props:   '), b(file.props.length))
				l('  ', dim('Slots:   '), b(file.slots.length))
				l('  ', dim('Events:  '), b(file.events.length))
				l('  ', dim('Exports: '), b(file.exports.length))

				break
			}

			//? Handle TS/JS Files
			case '.d.ts': {
				const file = parseTSFile(ctx)
				parsed_files.push(file)

				l(' ⤷', o(dts_file_name.replace(ext, '')))

				for (const { name } of file.exports) {
					l('    ', g(name))
				}

				l('  ', dim('Exports: '), b(file.exports.length))

				break
			}

			default:
				l(r(` ⤷ Skipped unknown file`))
				break
		}

		n()
	}

	await dts.cleanup()

	return parsed_files
}
