import type { Modifiers, TSDocComment } from './types'
import type { DocNode } from '@microsoft/tsdoc'
import type { Node } from 'ts-morph'

import { TSDocConfiguration, DocExcerpt, TSDocParser, TextRange } from '@microsoft/tsdoc'
import { TSDocConfigFile } from '@microsoft/tsdoc-config'
import { l, dim, r, y } from './utils/log'
import merge from '@fastify/deepmerge'
import ts from 'typescript'

const defaultTSDocConfig = {
	$schema: 'https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json',

	tagDefinitions: [
		{
			tagName: '@default',
			syntaxKind: 'block',
			allowMultiple: false,
		},
		{
			tagName: '@prop',
			syntaxKind: 'block',
			allowMultiple: true,
		},
		{
			tagName: '@note',
			syntaxKind: 'block',
			allowMultiple: true,
		},
	],

	supportForTags: {
		'@default': true,
		'@prop': true,
		'@note': true,
	},
}

export function createTSDocParser(tsdocConfigPath?: string) {
	let config: TSDocConfigFile

	if (tsdocConfigPath) {
		//? Load the config from disk
		const fileConfig = TSDocConfigFile.loadForFolder(tsdocConfigPath)

		if (fileConfig.hasErrors) {
			l(fileConfig.getErrorSummary())
		}

		//? Merge our default options with the config file
		const options = merge({ all: true })(defaultTSDocConfig, fileConfig.saveToObject() || {})

		config = TSDocConfigFile.loadFromObject(options)
	} else {
		//? Load the default options directly
		config = TSDocConfigFile.loadFromObject(defaultTSDocConfig)
	}

	//? Log errors from the config if there are any
	if (config.hasErrors) {
		l(config.getErrorSummary())
	}

	//? Use the TSDocConfigFile to configure the parser
	const tsdocConfiguration = new TSDocConfiguration()
	config.configureParser(tsdocConfiguration)

	return new TSDocParser(tsdocConfiguration)
}

export function parseCommentFromNode(node: Node, parser: TSDocParser) {
	const tsdoc_node = node
		.getChildrenOfKind(ts.SyntaxKind.JSDoc)
		?.map((node) => node.getText())
		// Filter out typedefs (they aren't particularly useful)
		.filter((text) => {
			// todo better solution
			return !text.startsWith('/** @typedef {typeof __propDef.')
		})

	//? There should only be one comment per node (I think)
	const comment = tsdoc_node?.[0]
	return comment ? parseComment(comment, parser) : undefined
}

/**
 * Parses a comment string into a {@link TSDocComment}.
 * @param The jsdoc comment to parse.
 */
export function parseComment(commentString: string, parser: TSDocParser): TSDocComment {
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

	for (const modifier of docComment.modifierTagSet.nodes) {
		const tagName = modifier.tagName.slice(1) as keyof Modifiers
		found[tagName] = true
	}

	if (docComment.customBlocks.length) {
		for (const block of docComment.customBlocks) {
			switch (block.blockTag.tagName) {
				case '@example':
					found.examples ??= []
					let content = render(block.content)

					// If the first char is a space, remove it.
					if (content.startsWith(' ')) {
						content = content.slice(1)
					}

					const name = content.split('\n')?.[0]?.trim()
					found.examples.push({ name, content: content.replace(name, '') })
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
