import type { SlotBit, Bit, ParsedSvelteFile } from '../types'
import type { TSDocParser } from '@microsoft/tsdoc'
import type { FileParserContext } from './files'
import type { SourceFile, Node } from 'ts-morph'

import { getName, getType, isExported, toBit } from '../utils/nodes'
import { parseCommentFromNode } from '../comments'
import ts from 'typescript'

export function parseSvelteFile({
	file_name,
	input_file_path,
	file,
	tsdoc,
}: FileParserContext): ParsedSvelteFile {
	//? Get the component name from the file name
	const componentName = file_name.replace('.svelte', '')

	//? Get the props, events, slots nodes
	const stuff = extractSvelteTypeNodes(file, tsdoc)

	//? Parse the props, events, slots nodes to bits
	const slots = stuff.slots?.map<SlotBit>((n) => parseSlot(n, tsdoc)) || []
	const events = stuff.events?.map<Bit>((n) => toBit(n, tsdoc)) || []
	const props = stuff.props?.map<Bit>((n) => toBit(n, tsdoc)) || []

	//? Extract the export bits
	const exports = extractModuleExports(componentName, file, tsdoc)

	const component_class_node = file.getDefaultExportSymbol()?.getValueDeclaration()

	return {
		fileName: file_name,
		filePath: input_file_path,
		comment: component_class_node
			? parseCommentFromNode(component_class_node, tsdoc)
			: undefined,
		componentName,
		props,
		events,
		slots,
		exports,
	}
}

/**
 * ? Find all the "key: value" nodes for props, events, and slots
 */
function extractSvelteTypeNodes(file: SourceFile, tsdoc: TSDocParser) {
	//? Find the props, events, slots objects
	const defs = file
		//? Find the __propDef variable declaration
		.getVariableDeclaration('__propDef')!
		//? Drill down in the ast to the props, events, slots nodes
		.getFirstChildByKind(ts.SyntaxKind.TypeLiteral)!
		.getFirstChildByKind(ts.SyntaxKind.SyntaxList)!
		.getChildren()

	//? Find a specific def
	function findDef(name: string) {
		const found = defs
			//? Find the def key in the __propDef
			.find((child) => child.getSymbol()?.getName() === name)!
			//? Drill down in the ast to the actual def
			.getFirstChildByKind(ts.SyntaxKind.TypeLiteral)
			?.getChildSyntaxList()
			?.getChildren()

		//? Return null if there are no props/slots, or the nodes if there are
		return !found || found.length == 0 ? null : found
	}

	function findEvents() {
		/**
		 * ?	Event Types can come in three shapes
		 *
		 * ?	Typed with $$Events
		 * ?	Use it directly
		 * *	{
		 * *		click: MouseEvent;
		 * *	}
		 *
		 * ?	Generated Automatically
		 * ?	We use the first half of the intersection
		 * *	{
		 * *		click: MouseEvent;
		 * *	} & {
		 * *		[evt: string]: CustomEvent<any>;
		 * *	};
		 *
		 * ?	Generated & Empty
		 * ?	Return null
		 * *	{
		 * *		[evt: string]: CustomEvent<any>;
		 * *	};
		 */

		//? This handles non-empty automatically generated event types
		const generatedEvents = defs
			//? Find the events key in the __propDef
			.find((child) => child.getSymbol()?.getName() === 'events')!
			//? This is undefined if there are no events.
			.getFirstChildByKind(ts.SyntaxKind.IntersectionType)
			//? Drill down in the ast to the events
			?.getFirstChildByKind(ts.SyntaxKind.SyntaxList)
			?.getFirstChildByKind(ts.SyntaxKind.TypeLiteral)
			?.getChildSyntaxList()
			?.getChildren()

		if (generatedEvents) {
			return generatedEvents.length == 0 ? null : generatedEvents
		}

		//? Find the empty generated or manually typed events
		const events = findDef('events')

		//? This case should only happen if it's just the generated events so we return null
		if (events?.length == 1 && events?.[0]?.getText().includes('[evt: string]')) {
			return null
		}

		return events
	}

	const props = findDef('props')
	const slots = findDef('slots')
	const events = findEvents()

	/**
	 * When a component has no props, it tends to
	 * have a single prop that looks like this:
	 *
	 ** {
	 **   comment: undefined,
	 **   name: "__index",
	 **   type: "any"
	 ** }
	 *
	 * This is rather useless, so we want to filter it out.
	 */
	if (props?.length === 1) {
		const { name, type } = toBit(props[0], tsdoc)

		if (name === '__index' && type === 'any') {
			props.pop()
		}
	}

	return {
		props,
		slots,
		events,
	}
}

function parseSlot(node: Node, tsdoc: TSDocParser): SlotBit {
	/**
	 * ? Slots look like this
	 *
	 * * slots: {
	 * * 	default: {
	 * * 		a: boolean;
	 * *    	b: () => boolean;
	 * * 	};
	 * * 	test: {};
	 * * };
	 */

	/**
	 * ? Find all the slot props
	 * ? Example slot type
	 *
	 * * slotName: {
	 * * 	prop: number
	 * * }
	 */
	const props = node
		.getChildrenOfKind(ts.SyntaxKind.TypeLiteral)[0]
		?.getChildSyntaxList()
		?.getChildren()
		?.map((node) => toBit(node, tsdoc))

	return {
		comment: parseCommentFromNode(node, tsdoc),
		name: getName(node) || 'it broke',
		props: props || [],
	}
}

function extractModuleExports(componentName: string, file: SourceFile, tsdoc: TSDocParser) {
	//? Nodes we don't care about, they are handled elsewhere
	const ignoredNodeNames = [
		'default',
		`${componentName}Props`,
		`${componentName}Events`,
		`${componentName}Slots`,
		`${componentName}SlotsDef`,
	]

	return (
		file
			.getStatements()
			//? Only get exports
			.filter(isExported)
			//? Filter things we don't care about
			.filter((node) => !ignoredNodeNames.includes(getName(node) || ''))
			//? Extract the bits
			.map<Bit>((node) => {
				switch (node.getKind()) {
					case ts.SyntaxKind.VariableStatement: {
						const declaration = node.getFirstDescendantByKind(
							ts.SyntaxKind.VariableDeclaration,
						)!

						return {
							comment: parseCommentFromNode(node, tsdoc),
							name: getName(declaration) || 'it broke ahjk',
							type: getType(declaration),
						}
					}

					default:
						return toBit(node, tsdoc)
				}
			})
	)
}
