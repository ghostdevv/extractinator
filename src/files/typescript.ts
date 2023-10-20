import type { TSDocParser } from '@microsoft/tsdoc'
import type { Bit, ParsedTSFile } from '../types'
import type { SourceFile } from 'ts-morph'

import { parseCommentFromNode } from '../comments'
import { getType } from '../utils/nodes'
import ts from 'typescript'

export function parseTSFile(file: SourceFile, tsdoc: TSDocParser): ParsedTSFile {
	const export_bits: Bit[] = []

	//? Loop over all the export declarations
	for (const [name, declarations] of file.getExportedDeclarations()) {
		// todo handle this
		if (declarations.length > 1) {
			throw new Error(
				`Multiple declarations are not handled yet, please file issue "${file.getBaseName()}"`,
			)
		}

		//? Let's only deal with a single array cast
		const [declaration] = declarations

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
			comment: tsdoc_node_parent ? parseCommentFromNode(tsdoc_node_parent, tsdoc) : undefined,
		})
	}

	return {
		fileName: file.getBaseName(),
		exports: export_bits,
	}
}
