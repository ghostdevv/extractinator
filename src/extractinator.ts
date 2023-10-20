import type { ParsedFile } from './types'

import { l, b, n, o, g, r, dim } from './utils/log'
import { parseSvelteFile } from './files/svelte'
import { parseTSFile } from './files/typescript'
import { createTSDocParser } from './comments'
import { mkdir, writeFile } from 'fs/promises'
import { Project } from 'ts-morph'
import { emit_dts } from './emit'

export async function extractinator(input: string, output: string, tsdocConfigPath?: string) {
	//? Create ts-morph project
	const project = new Project()

	//? Generate the .svelte.d.ts files
	const dts = await emit_dts(input)

	//? Load all the generated Svelte .d.ts files
	project.addSourceFilesAtPaths(`${dts.location}/**/*?(.svelte).d.ts`)

	//? Make sure the output directory exists
	await mkdir(output, { recursive: true })

	const tsdoc = createTSDocParser(tsdocConfigPath)

	//? Map of file_location:file
	const parsed_files = new Map<string, ParsedFile>()

	//? Loop over all the loaded source files
	for (const sourceFile of project.getSourceFiles()) {
		//? Get the filename e.g. KitchenSink.svelte.d.ts
		const fileName = sourceFile.getBaseName()

		//? Work out the file extension
		const ext = fileName.endsWith('.svelte.d.ts')
			? '.svelte.d.ts'
			: fileName.endsWith('.d.ts')
			? '.d.ts'
			: null

		l(`Processing File (${dim(ext)}) "${o(fileName)}"`)

		switch (ext) {
			//? Handle Svelte Files
			case '.svelte.d.ts': {
				const file = parseSvelteFile(sourceFile, tsdoc)
				parsed_files.set(`${output}/${file.componentName}.doc.json`, file)

				l(' ⤷', o(file.componentName))
				l('  ', dim('Props:   '), b(file.props.length))
				l('  ', dim('Slots:   '), b(file.slots.length))
				l('  ', dim('Events:  '), b(file.events.length))
				l('  ', dim('Exports: '), b(file.variables.length))

				break
			}

			//? Handle TS/JS Files
			case '.d.ts': {
				const basename = fileName.replace(ext, '')

				const file = parseTSFile(sourceFile, tsdoc)
				parsed_files.set(`${output}/${basename}.doc.json`, file)

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

	for (const [location, file] of parsed_files) {
		// todo could potentially collide
		await writeFile(location, JSON.stringify(file, null, 2), 'utf-8')
	}

	//? Cleanup
	await dts.cleanup()
}
