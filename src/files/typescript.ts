import type { ExportBit, ParsedTSFile } from '../types'
import type { FileParserContext } from './files'

import { parseCommentFromNode } from '../comments'
import { getType } from '../utils/nodes'
import ts from 'typescript'

export function parseTSFile({
	file_name,
	input_file_path,
	file,
	tsdoc,
}: FileParserContext): ParsedTSFile {
	const export_bits: ExportBit[] = []

	//? Loop over all the export declarations
	for (const [name, declarations] of file.getExportedDeclarations()) {
		for (const declaration of declarations) {
			const tsdoc_node_parent = declaration.getFirstChildIfKind(ts.SyntaxKind.JSDoc)
				? //? Check whether the declaration has a comment
				  declaration
				: //? Find the comment by traversing up the parent, this should be safe here
				  declaration
						.getAncestors()
						.find((ancestor) => !!ancestor.getFirstChildIfKind(ts.SyntaxKind.JSDoc))

			export_bits.push({
				name,
				type: getType(declaration),
				isDefaultExport: name == 'default',
				comment: tsdoc_node_parent
					? parseCommentFromNode(tsdoc_node_parent, tsdoc)
					: undefined,
			})
		}
	}

	return {
		type: 'ts',
		fileName: file_name,
		filePath: input_file_path,
		exports: export_bits,
	}
}
