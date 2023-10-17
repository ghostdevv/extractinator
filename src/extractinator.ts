import type { SlotBit, Bit, ParsedSvelteFile } from './types'
import type { TSDocParser } from '@microsoft/tsdoc'

import { createTSDocParser, parseCommentFromNode } from './comments'
import { getName, getType, isExported } from './utils/nodes'
import { Project, SourceFile, Node } from 'ts-morph'
import { l, b, n, o, g, r, dim } from './utils/log'
import { mkdir, rm, writeFile } from 'fs/promises'
import { emit } from './emit'
import ts from 'typescript'

export async function extractinator(input: string, output: string, tsdocConfigPath?: string) {
	//? Create ts-morph project
	const project = new Project()

	//? Generate the .svelte.d.ts files
	const dts = await emit(input)

	//? Load all the generated Svelte .d.ts files
	project.addSourceFilesAtPaths(`${dts.location}/**/*?(.svelte).d.ts`)

	//? Make sure the output directory exists
	await mkdir(output, { recursive: true })

	const tsdoc = createTSDocParser(tsdocConfigPath)

	for (const sourceFile of project.getSourceFiles()) {
		const fileName = sourceFile.getBaseName()

		if (!fileName.endsWith('.svelte.d.ts')) {
			l(r(`Skipped file ${fileName}`))
			n()

			continue
		}

		const file = parseFile(sourceFile, tsdoc)

		l(o(file.componentName))
		l(dim('Props:   '), b(file.props.length))
		l(dim('Slots:   '), b(file.slots.length))
		l(dim('Events:  '), b(file.events.length))
		l(dim('Exports: '), b(file.variables.length))
		n()

		await writeFile(
			`${output}/${file.componentName}.doc.json`,
			JSON.stringify(file, null, 2),
			'utf-8',
		)
	}

	//? Cleanup
	await rm(dts.location, { recursive: true })
}

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
 * Convert the node into a {@link Bit}
 */
function toBit(node: Node, parser: TSDocParser): Bit {
	return {
		comment: parseCommentFromNode(node, parser),
		name: getName(node) || 'it broke',
		type: getType(node),
	}
}

function parseSlot(node: Node, parser: TSDocParser): SlotBit {
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
		?.map((node) => toBit(node, parser))

	return {
		comment: parseCommentFromNode(node, parser),
		name: getName(node) || 'it broke',
		props: props || [],
	}
}

function extractModuleExports(componentName: string, file: SourceFile, parser: TSDocParser) {
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
							comment: parseCommentFromNode(node, parser),
							name: getName(declaration) || 'it broke ahjk',
							type: getType(declaration),
						}
					}

					default:
						return toBit(node, parser)
				}
			})
	)
}

function parseFile(file: SourceFile, parser: TSDocParser): ParsedSvelteFile {
	//? Get the component name from the file name
	const componentName = file.getBaseName().replace('.svelte.d.ts', '')

	//? Get the props, events, slots nodes
	const stuff = extractSvelteTypeNodes(file)

	//? Parse the props, events, slots nodes to bits
	const slots = stuff.slots?.map<SlotBit>((n) => parseSlot(n, parser)) || []
	const events = stuff.events?.map<Bit>((n) => toBit(n, parser)) || []
	const props = stuff.props?.map<Bit>((n) => toBit(n, parser)) || []

	//? Extract the export bits
	const variables = extractModuleExports(componentName, file, parser)

	return {
		file: file.getFilePath(),
		componentName,
		props,
		events,
		slots,
		variables,
	}
}
