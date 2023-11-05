export type ParsedFile = ParsedSvelteFile | ParsedTSFile

export interface BaseParsedFile {
	/**
	 * The name of the file read
	 *
	 * @example
	 * KitchenSink.svelte
	 * example.ts
	 */
	fileName: string

	/**
	 * The absolute path to the source file used
	 *
	 * @example
	 * /home/ghost/Desktop/extractinator/playground/KitchenSink.svelte
	 */
	filePath: string
}

export interface ParsedTSFile extends BaseParsedFile {
	/**
	 * The exports from the component
	 */
	exports: Bit[]
}

export interface ParsedSvelteFile extends BaseParsedFile {
	/**
	 * The name of the component
	 *
	 * @example
	 * KitchenSink
	 */
	componentName: string

	props: Bit[]
	events: Bit[]
	slots: SlotBit[]
	variables: Bit[]
}

/**
 * A human readable interface for a tsdoc comment.
 */
export interface TSDocComment {
	summary?: string
	remarks?: string
	params?: { name: string; description: string }[]
	typeParams?: { name: string; description: string }[]
	defaultValue?: string
	returns?: string
	notes?: string[]
	examples?: string[]
	seeBlocks?: string[]
	customBlocks?: { tagName: string; content: string }[]
	/** The raw tsdoc comment. */
	raw: string
}

/**
 * A bit of exported (documented) code.
 */
export interface Bit {
	/**
	 * Name of the bit. E.g. a variable name
	 */
	name: string

	/**
	 * The typescript type of the variable.
	 */
	type: string

	/**
	 * The TSDoc comment data
	 */
	comment?: TSDocComment
}

export interface ExportBit extends Bit {
	/**
	 * Whether the export is the default
	 */
	isDefaultExport: boolean
}

export interface SlotBit extends Omit<Bit, 'type'> {
	/**
	 * The props of the slot
	 *
	 * @example
	 * Input:
	 * <slot doSomething={true} />
	 *
	 * Output:
	 * ```json
	 * {
	 * 	 "name": "doSomething",
	 *   "type": "boolean"
	 * }
	 * ```
	 */
	props: Bit[]
}
