import type { DocNode } from '@microsoft/tsdoc'
import type { TSDocComment } from './types'
import type { Node } from 'ts-morph'

import { TSDocConfiguration, DocExcerpt, TSDocParser, TextRange } from '@microsoft/tsdoc'
import { TSDocConfigFile } from '@microsoft/tsdoc-config'
import { l, dim, r, y } from './log'
import ts from 'typescript'

//? Load the nearest config file, for example `my-project/tsdoc.json`
const tsdocConfigFile = TSDocConfigFile.loadForFolder('./')
if (tsdocConfigFile.hasErrors) {
	//? Report any errors
	l(tsdocConfigFile.getErrorSummary())
}

//? Use the TSDocConfigFile to configure the parser
const tsdocConfiguration = new TSDocConfiguration()
tsdocConfigFile.configureParser(tsdocConfiguration)

const parser = new TSDocParser(tsdocConfiguration)

export function parseCommentFromNode(node: Node) {
	const commentString = node.getChildrenOfKind(ts.SyntaxKind.JSDoc)[0]?.getText()
	return commentString ? parseComment(commentString) : undefined
}

/**
 * Parses a comment string into a {@link TSDocComment}.
 * @param The jsdoc comment to parse.
 */
export function parseComment(commentString: string): TSDocComment {
	const { docComment } = parser.parseRange(TextRange.fromString(commentString))

	const found: TSDocComment = {
		raw: docComment.emitAsTsdoc(),
	}

	if (docComment.summarySection) {
		found.summary = render(docComment.summarySection)
	}

	if (docComment.params.blocks.length) {
		found.params = docComment.params.blocks.map((b) => {
			return {
				name: b.parameterName,
				description: render(b.content),
			}
		})
	}

	if (docComment.typeParams.blocks.length) {
		found.typeParams = docComment.typeParams.blocks.map((b) => {
			return {
				name: b.parameterName,
				description: render(b.content),
			}
		})
	}

	if (docComment.returnsBlock) {
		found.returns = render(docComment.returnsBlock.content)
	}

	if (docComment.remarksBlock) {
		found.remarks = render(docComment.remarksBlock.content)
	}

	if (docComment.seeBlocks.length) {
		found.seeBlocks = docComment.seeBlocks.map((b) => render(b.content))
	}

	if (docComment.customBlocks.length) {
		for (const block of docComment.customBlocks) {
			switch (block.blockTag.tagName) {
				case '@example':
					found.examples ??= []
					found.examples.push(render(block.content))
					break
				case '@note':
					found.notes ??= []
					found.notes.push(render(block.content))
					break
				case '@default':
				case '@defaultValue':
					found.defaultValue = render(block.content)
					break
				default:
					found.customBlocks ??= []
					found.customBlocks.push({
						tagName: block.blockTag.tagName,
						content: render(block.content),
					})
					break
			}
		}

		if (found.customBlocks?.length) {
			console.warn(y('Unused custom blocks found:'))
			found.customBlocks.forEach((b) => {
				console.log(r(b.tagName), dim(b.content))
			})
		}
	}

	return found
}

/**
 * Renders a {@link DocNode} into a string.
 */
export function render(docNode: DocNode): string {
	let result: string = ''
	if (docNode) {
		if (docNode instanceof DocExcerpt) {
			result += docNode.content.toString()
		}
		for (const childNode of docNode.getChildNodes()) {
			result += render(childNode)
		}
	}
	return result.trim()
}
