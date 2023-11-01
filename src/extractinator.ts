import type { FileParserContext } from './files/files'
import type { ParsedFile } from './types'

import { l, b, n, o, g, r, dim } from './utils/log'
import { parseSvelteFile } from './files/svelte'
import { parseTSFile } from './files/typescript'
import { createTSDocParser } from './comments'
import { basename } from 'node:path'
import { Project } from 'ts-morph'
import { emit_dts } from './emit'

export interface ExtractinatorOptions {
	tsdocConfigPath?: string
	input: string
}

export async function extractinator(options: ExtractinatorOptions) {
	const project = new Project()

	//? Generate the .d.ts files
	const dts = await emit_dts(options.input)

	//? Load all the generated .d.ts files
	for (const dts_path of dts.dts_file_map.keys()) {
		project.addSourceFileAtPath(dts_path)
	}

	const tsdoc = createTSDocParser(options.tsdocConfigPath)

	const parsed_files: ParsedFile[] = []

	//? Loop over all the loaded source files
	for (const source_file of project.getSourceFiles()) {
		//? Get the filename e.g. KitchenSink.svelte.d.ts
		const dts_file_name = source_file.getBaseName()

		//? Get the input file name
		const input_file_path = dts.dts_file_map.get(source_file.getFilePath())!
		const file_name = basename(input_file_path)

		//? Work out the file extension
		const ext = dts_file_name.endsWith('.svelte.d.ts')
			? '.svelte.d.ts'
			: dts_file_name.endsWith('.d.ts')
			? '.d.ts'
			: null

		l(`Processing File (${dim(ext)}) "${o(file_name)}"`)

		const ctx: FileParserContext = {
			file_name,
			input_file_path,
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
				l('  ', dim('Exports: '), b(file.variables.length))

				break
			}

			//? Handle TS/JS Files
			case '.d.ts': {
				const basename = dts_file_name.replace(ext, '')

				const file = parseTSFile(ctx)
				parsed_files.push(file)

				l(' ⤷', o(basename))

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
