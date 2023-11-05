import { mkdir, writeFile } from 'node:fs/promises'
import { extractinator } from '../extractinator'
import { resolve } from 'node:path'
import sade from 'sade'

const cli = sade('extractinator')

cli.version(__VERSION__)

interface ExtractOtpions {
	// tsconfig: string
	'tsdoc-config'?: string
}

cli.command('extract <input> <output>')
	.describe('Extract the nator')
	// .option('--tsconfig', 'Path to a custom tsconfig.json')
	.option('--tsdoc-config', 'Path to a custom tsdoc.json')
	.action(async (input: string, output: string, options: ExtractOtpions) => {
		input = resolve(input)
		output = resolve(output)

		const extracted_files = await extractinator({
			tsdocConfigPath: options['tsdoc-config'],
			input,
		})

		//? Make sure the output directory exists
		await mkdir(output, { recursive: true })

		//? Write out all the files that we extracted
		for (const file of extracted_files) {
			// todo could potentially collide, should mimic original folder structure
			await writeFile(
				`${output}/${file.fileName}.doc.json`,
				JSON.stringify(file, null, 2),
				'utf-8',
			)
		}
	})

cli.parse(process.argv)