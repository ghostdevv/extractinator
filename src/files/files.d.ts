import type { TSDocParser } from '@microsoft/tsdoc'
import type { SourceFile } from 'ts-morph'

export interface FileParserContext {
	file_name: string
	input_file_path: string
	file: SourceFile
	tsdoc: TSDocParser
}
