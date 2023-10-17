import { extractinator } from './extractinator'
import { join, resolve } from 'node:path'
import sade from 'sade'
import './types.d'

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

		await extractinator(input, output, options['tsdoc-config'])
	})

cli.parse(process.argv)
