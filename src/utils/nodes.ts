import type { TSDocParser } from '@microsoft/tsdoc'
import type { Node } from 'ts-morph'
import type { Bit } from '../types'

import { parseCommentFromNode } from '../comments'
import ts from 'typescript'

export function isExported(node: Node) {
	return !!node
		.getFirstChildByKind(ts.SyntaxKind.SyntaxList)
		?.getFirstChildByKind(ts.SyntaxKind.ExportKeyword)
}

/**
 * Attempts to get the node name
 */
export function getName(node: Node) {
	return node.getSymbol()?.getName() || null
}

/**
 * Attempts to get the node type
 */
export function getType(node: Node) {
	return (
		node
			.getType()
			.getText()
			//? Remove all `import("...")`
			.replace(/import\((?:"|')[^]+?(?:"|')\)\./g, '')
	)
}

/**
 * Convert the node into a {@link Bit}
 */
export function toBit(node: Node, tsdoc: TSDocParser): Bit {
	return {
		comment: parseCommentFromNode(node, tsdoc),
		name: getName(node) || 'it broke',
		type: getType(node),
	}
}
