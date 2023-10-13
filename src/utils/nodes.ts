import { Node } from 'ts-morph'
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
