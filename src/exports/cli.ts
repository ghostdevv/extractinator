#!/usr/bin/env node
import { mkdir, stat, writeFile } from 'node:fs/promises'
import { extractinator } from '../extractinator'
import { r, setLogLevel } from '../utils/log'
import { resolve } from 'node:path'
import sade from 'sade'

const cli = sade('extractinator')

cli.version(__VERSION__)

interface ExtractOtpions {
	// tsconfig: string // todo - why was this removed?
	'tsdoc-config'?: string
	c?: string
	'log-level'?: 'quiet' | 'info' | 'verbose'
	l?: 'quiet' | 'info' | 'verbose'
}

cli.command('extract <input> <output>')
	.describe('Run extractinator against a folder of svelte/ts/js files and save it to the output')
	.option('--tsdoc-config, -t', 'Path to a custom tsdoc.json')
	.option('--log-level, -l', 'quiet | info | verbose', 'info')
	.action(async (input: string, output: string, options: ExtractOtpions) => {
		input = resolve(input)
		output = resolve(output)

		setLogLevel(options['log-level'] ?? 'info')

		//? First, let's figure out if the input is a file or a folder.
		const input_stat = await stat(input)

		if (!input_stat) {
			throw new Error(`Unable to find input: "${input}"`)
		}

		if (input_stat.isFile()) {
			console.error(r(`Error:`), `Input is a file, please provide a folder.`)
			return
		}

		const extracted_files = await extractinator({
			tsdocConfigPath: options['tsdoc-config'],
			input,
		})

		//? Make sure the output directory exists
		await mkdir(output, { recursive: true })

		//? Write out all the files that we extracted
		for (const file of extracted_files) {
			// todo - handle collisions!
			await writeFile(
				`${output}/${file.fileName}.doc.json`,
				JSON.stringify(file, null, 2),
				'utf-8',
			)
		}
	})

cli.parse(process.argv)
