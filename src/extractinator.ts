import { l, b, n, o, g, r, dim } from './utils/log'
import { parseSvelteFile } from './files/svelte'
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

	for (const sourceFile of project.getSourceFiles()) {
		const fileName = sourceFile.getBaseName()
		const ext = fileName.endsWith('.svelte.d.ts')
			? '.svelte.d.ts'
			: fileName.endsWith('.d.ts')
			? '.d.ts'
			: null

		l(`Processing File (${dim(ext)}) "${o(fileName)}"`)

		switch (ext) {
			case '.svelte.d.ts': {
				const file = parseSvelteFile(sourceFile, tsdoc)

				l(' ⤷', o(file.componentName))
				l('  ', dim('Props:   '), b(file.props.length))
				l('  ', dim('Slots:   '), b(file.slots.length))
				l('  ', dim('Events:  '), b(file.events.length))
				l('  ', dim('Exports: '), b(file.variables.length))

				await writeFile(
					`${output}/${file.componentName}.doc.json`,
					JSON.stringify(file, null, 2),
					'utf-8',
				)
				break
			}

			case '.d.ts':
				l(b(` ⤷ Skipped ts file for now`))
				break

			default:
				l(r(` ⤷ Skipped unknown file`))
				break
		}

		n()
	}

	//? Cleanup
	await dts.cleanup()
}
