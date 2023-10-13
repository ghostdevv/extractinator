import type { SlotBit, Bit, ParsedSvelteFile } from './types'
import { Project, SourceFile, Node } from 'ts-morph'
import { parseCommentFromNode } from './comments'
import { writeFile } from 'node:fs/promises'
import { l, b, n, o, g, dim } from './log'
import { OUTPUT_DIR } from './vars'
import ts from 'typescript'

//? Create ts-morph project
const project = new Project()

//? Load all the generated Svelte .d.ts files
project.addSourceFilesAtPaths(`${OUTPUT_DIR}/**/*.svelte.d.ts`)

/**
 * ? Find all the "key: value" nodes for props, events, and slots
 */
function extractSvelteTypeNodes(file: SourceFile) {
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

	return {
		props: findDef('props'),
		slots: findDef('slots'),
		events: findEvents(),
	}
}

/**
 * Attempts to get the node name
 */
function getName(node: Node) {
	return node.getSymbol()?.getName() || null
}

/**
 * Attempts to get the node type
 */
function getType(node: Node) {
	return (
		node
			.getType()
			.getText()
			//? Remove all import("...")
			.replace(/import\((?:"|')[^]+?(?:"|')\)\./g, '')
	)
}

/**
 * Convert the node into a {@link Bit}
 */
function toBit(node: Node): Bit {
	return {
		comment: parseCommentFromNode(node),
		name: getName(node) || 'it broke',
		type: getType(node),
	}
}

function parseSlot(node: Node): SlotBit {
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
		?.map(toBit)

	return {
		comment: parseCommentFromNode(node),
		name: getName(node) || 'it broke',
		props: props || [],
	}
}

function extractModuleExports(componentName: string, file: SourceFile) {
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
							comment: parseCommentFromNode(node),
							name: getName(declaration) || 'it broke ahjk',
							type: getType(declaration),
						}
					}

					default:
						return toBit(node)
				}
			})
	)
}

function isExported(node: Node) {
	return !!node
		.getFirstChildByKind(ts.SyntaxKind.SyntaxList)
		?.getFirstChildByKind(ts.SyntaxKind.ExportKeyword)
}

const parsed: ParsedSvelteFile[] = []

for (const file of project.getSourceFiles()) {
	//? Get the component name from the file name
	const componentName = file.getBaseName().replace('.svelte.d.ts', '')

	l(o(componentName))

	//? Get the props, events, slots nodes
	const stuff = extractSvelteTypeNodes(file)

	//? Parse the props, events, slots nodes to bits
	const slots = stuff.slots?.map<SlotBit>(parseSlot) || []
	const events = stuff.events?.map<Bit>(toBit) || []
	const props = stuff.props?.map<Bit>(toBit) || []

	//? Extract the export bits
	const variables = extractModuleExports(componentName, file)

	l(dim('Props:   '), b(stuff.props?.length || 0))
	l(dim('Slots:   '), b(stuff.slots?.length || 0))
	l(dim('Events:  '), b(stuff.events?.length || 0))
	l(dim('Exports: '), b(variables.length || 0))
	n()

	parsed.push({
		file: file.getFilePath(),
		componentName,
		props,
		events,
		slots,
		variables,
	})
}

writeFile(`${OUTPUT_DIR}/out.json`, JSON.stringify(parsed, null, 2), 'utf-8')

l(g('done'))
