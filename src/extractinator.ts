import type { ParsedFile } from './types'

import { l, b, n, o, g, r, dim } from './utils/log'
import { parseSvelteFile } from './files/svelte'
import { parseTSFile } from './files/typescript'
import { createTSDocParser } from './comments'
import { mkdir, writeFile } from 'fs/promises'
import { basename } from 'node:path'
import { Project } from 'ts-morph'
import { emit_dts } from './emit'

export async function extractinator(input: string, output: string, tsdocConfigPath?: string) {
	const project = new Project()

	//? Generate the .d.ts files
	const dts = await emit_dts(input)

	//? Load all the generated .d.ts files
	for (const dts_path of dts.dts_file_map.keys()) {
		project.addSourceFileAtPath(dts_path)
	}

	//? Make sure the output directory exists
	await mkdir(output, { recursive: true })

	const tsdoc = createTSDocParser(tsdocConfigPath)

	//? Map of input_file_path:file
	const parsed_files = new Map<string, ParsedFile>()

	//? Loop over all the loaded source files
	for (const sourceFile of project.getSourceFiles()) {
		//? Get the filename e.g. KitchenSink.svelte.d.ts
		const dts_file_name = sourceFile.getBaseName()

		//? Get the input file name
		const input_file_path = dts.dts_file_map.get(sourceFile.getFilePath())!
		const file_name = basename(input_file_path)

		//? Work out the file extension
		const ext = dts_file_name.endsWith('.svelte.d.ts')
			? '.svelte.d.ts'
			: dts_file_name.endsWith('.d.ts')
			? '.d.ts'
			: null

		l(`Processing File (${dim(ext)}) "${o(file_name)}"`)

		switch (ext) {
			//? Handle Svelte Files
			case '.svelte.d.ts': {
				const file = parseSvelteFile(file_name, sourceFile, tsdoc)
				parsed_files.set(input_file_path, file)

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

				const file = parseTSFile(file_name, sourceFile, tsdoc)
				parsed_files.set(input_file_path, file)

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

	for (const [input_file_path, file] of parsed_files) {
		// todo could potentially collide
		await writeFile(
			`${output}/${basename(input_file_path)}.doc.json`,
			JSON.stringify(file, null, 2),
			'utf-8',
		)
	}

	//? Cleanup
	await dts.cleanup()
}
