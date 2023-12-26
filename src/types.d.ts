export interface ExtractinatorOptions {
	/**
	 * Path to your tsdoc config
	 */
	tsdocConfigPath?: string

	/**
	 * Path to your input svelte/ts/js files, it'll read the directory recursively
	 */
	input: string
}

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
	type: 'ts'

	/**
	 * The exports from the ts file
	 */
	exports: ExportBit[]
}

export interface ParsedSvelteFile extends BaseParsedFile {
	type: 'svelte'

	/**
	 * The name of the component
	 *
	 * @example
	 * KitchenSink
	 */
	componentName: string

	/**
	 * The top level component comment
	 *
	 * @example
	 * <!--
	 *	 @component
	 *   Kitchen Sink Svelte Component
	 * -->
	 */
	comment?: TSDocComment

	/**
	 * The props of the component
	 *
	 * @example
	 * Input:
	 * ```svelte
	 * <script>
	 * 	export let open = false;
	 * 	export let name: string;
	 * </script>
	 * ```
	 *
	 * Output:
	 * ```json
	 * [
	 *   {
	 * 	   "name": "open",
	 * 	   "type": "boolean"
	 * 	 },
	 * 	 {
	 *     "name": "name",
	 *     "type": "string"
	 *   }
	 * ]
	 * ```
	 */
	props: Bit[]

	/**
	 * The component events
	 *
	 * @example
	 * Input:
	 * ```svelte
	 * <button on:click> Click Me </button>
	 * ```
	 *
	 * Output:
	 * ```json
	 * [
	 *   {
	 * 	   "name": "click",
	 * 	   "type": "HTMLElementEventMap"
	 * 	 }
	 * ]
	 * ```
	 */
	events: Bit[]

	/**
	 * The props of the slot
	 *
	 * @example
	 * Input:
	 * ```svelte
	 * <slot />
	 * <slot name="test" />
	 * ```
	 *
	 * Output:
	 * ```json
	 * [
	 *   {
	 *     "name": "default",
	 *     "props": []
	 *   },
	 *   {
	 *     "name": "test",
	 *     "props": []
	 *   }
	 * ]
	 * ```
	 */
	slots: SlotBit[]

	/**
	 * The module exports of the component
	 *
	 * @example
	 * Input:
	 * ```svelte
	 * <script context="module">
	 *   import { writable } from 'svelte/store'
	 *
	 *	 export const state = writable<string | number | boolean>(true)
	 * </script>
	 * ```
	 *
	 * Output:
	 * ```json
	 * {
	 *   "name": "state",
	 *   "type": "Writable<string | number | boolean>"
	 * }
	 * ```
	 */
	exports: Omit<ExportBit, 'isDefaultExport'>[]
}

/**
 * A human readable interface for a tsdoc comment.
 */
export interface TSDocComment extends Modifiers {
	summary?: string
	remarks?: string
	params?: { name: string; description: string }[]
	typeParams?: { name: string; description: string }[]
	defaultValue?: string
	returns?: string
	notes?: string[]
	examples?: {
		name?: string
		content: string
	}[]
	seeBlocks?: string[]
	customBlocks?: { tagName: string; content: string }[]
	/** The raw tsdoc comment. */
	raw: string
	// todo - decorator
	// todo - eventProperty
	// todo - deprecated
}

export interface Modifiers {
	alpha?: boolean
	beta?: boolean
	eventProperty?: boolean
	experimental?: boolean
	internal?: boolean
	override?: boolean
	packageDocumentation?: boolean
	public?: boolean
	readonly?: boolean
	sealed?: boolean
	virtual?: boolean
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
	 * ```svelte
	 * <slot doSomething={true} />
	 * ```
	 *
	 * Output:
	 * ```json
	 * [
	 * 	 {
	 * 	   "name": "doSomething",
	 *     "type": "boolean"
	 * 	 }
	 * ]
	 * ```
	 */
	props: Bit[]
}
