import type { DocComment, DocLinkTag, DocNode } from '@microsoft/tsdoc'
import type { Modifiers, ParsedExample, TSDocComment } from './types'
import type { Node } from 'ts-morph'

import { TSDocConfiguration, DocExcerpt, TSDocParser, TextRange } from '@microsoft/tsdoc'
import { TSDocConfigFile } from '@microsoft/tsdoc-config'
import { lv, dim, r, y, l, warn } from './utils/log'
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
			lv(fileConfig.getErrorSummary())
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
		lv(config.getErrorSummary())
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
	return comment ? parseComment(comment, parser, node) : undefined
}

/**
 * Parses a comment string into a {@link TSDocComment}.
 * @param The jsdoc comment to parse.
 */
export function parseComment(commentString: string, parser: TSDocParser, node: Node): TSDocComment {
	const { docComment } = parser.parseRange(TextRange.fromString(commentString))

	const found: TSDocComment = {
		raw: docComment.emitAsTsdoc().trimEnd(),
	}

	extractLinkTags(docComment, found)

	if (docComment.summarySection) {
		found.summary = renderMultiline(docComment.summarySection)
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
					const e: ParsedExample = {
						name: undefined,
						content: renderMultiline(block.content),
					}

					const name = e.content.split('\n')?.[0]?.trim()

					if (name && !name.startsWith('```')) {
						e.name = name
						e.content = e.content.replace(name, '')
					}

					found.examples.push(e)
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
			warn(y('Unused custom blocks found:'))
			found.customBlocks.forEach((b) => {
				l(r(b.tagName), dim(b.content))
			})
		}
	}

	return found
}

function extractLinkTags(docComment: DocComment, tsDocComment: TSDocComment) {
	function visit(node: DocNode) {
		for (const child of node.getChildNodes()) {
			switch (child.kind) {
				case 'LinkTag': {
					const n = child as DocLinkTag

					const { linkText, urlDestination, codeDestination } = n
					const name =
						codeDestination?.memberReferences?.[0]?.memberIdentifier?.identifier

					const link = {
						target: urlDestination ?? name ?? '',
						text: linkText ?? name ?? '',
					}

					if (link.target && link.text) {
						tsDocComment.links ??= []
						tsDocComment.links.push(link)
					}

					break
				}
			}

			visit(child)
		}
	}

	visit(docComment)

	// 	if (tsDocComment.links?.length) {
	// 		nv(2)
	// 		lv('Links:', tsDocComment.links)
	// 		lv('SeeBlocks:', tsDocComment.seeBlocks)
	// 		nv(2)
	// 	}
}

/**
 * Renders a {@link DocNode} into a string.
 */
export function render(docNode: DocNode, trim = true): string {
	let result = ''

	if (docNode) {
		if (docNode instanceof DocExcerpt) {
			result += docNode.content.toString()
		}
		for (const childNode of docNode.getChildNodes()) {
			result += render(childNode, trim)
		}
	}

	return trim ? result.trim() : result
}

/**
 * Renders a {@link DocNode} into a string.
 */
export function renderMultiline(docNode: DocNode, trim = true): string {
	let str = ''

	visit(docNode)

	function visit(node: DocNode) {
		if (node instanceof DocExcerpt) {
			let text = node.content.toString()

			// Skip empty strings
			if (text) {
				//! This is causing all kinds of problems...
				// // Skip non-alphabetical characters.
				// if (text.match(/[a-zA-Z]/)) {
				// 	/**
				// 	 * Add a space before the text if it's not a special character to
				// 	 * prevent words separated by newlines from being joined together.
				// 	 */
				// 	if (!['@link'].some((c) => text === c)) {
				// 		l(o('Prepending space to text:', text))
				// 		text = ' ' + text
				// 	}
				// }

				str += text
			}
		}

		for (const childNode of node.getChildNodes()) {
			visit(childNode)
		}

		return str
	}

	/**
	 * This removes orphaned newlines introduced by multiline comments,
	 * unless they are followed by another newline (which indicates a new
	 * paragraph).
	 */
	// str = str.replace(/(?<!\s*\n\s*)\n(?!\s*\n\s*)/gm, '')

	/**
	 * This removes spaces after newlines to prevents multiline comments from
	 * having extra spaces at the beginning of each new line.  For example:
	 *
	 *
	 *?   This is
	 *?   a multiline
	 *?   comment.
	 *?
	 *?   With 2 paragraphs.
	 *
	 *
	 * Renders as this:
	 *
	 ** This is a multiline comment. \n\n With 2 paragraphs.
	 *                                   ^
	 *                                    extra space
	 *
	 * But `str.replaceAll('\n ', '\n')` fixes it:
	 *
	 ** This is a multiline comment. \n\nWith 2 paragraphs.
	 *									 ^
	 *									  no extra space
	 */
	str = str.replaceAll('\n ', '\n')

	// Remove duplicate spaces.
	str = str.replaceAll('  ', ' ')

	// Fix links (see the addSpacesToLink docs for more info)
	str = linkTagToUrl(str)

	/**
	 * We always want to trim the start since the first line of a
	 * comment is always indented, but we don't want that to be
	 * included in the rendered comment.
	 */
	return trim ? str.trim() : str.trimStart()
}

// /**
//  * {@link render} removes spaces in link tags for some reason...
//  * For example, it turns `{\@link render}` into `{\@linkrender}`.
//  * This function just adds the spaces back in.
//  */
// function addSpacesToLink(str: string) {
// 	return str.replace(/(\S+)\{@link(\S+)\}(\S+)/g, '$1 {@link $2} $3')
// }

/**
 * Converts a link tag to markdown url syntax. i.e.
 * {\@link foo}
 * becomes
 * [foo](#foo)
 */
function linkTagToUrl(str: string) {
	return str.replace(/\{@link\s+([^}]+)\}/g, '[$1](#$1)')
}
