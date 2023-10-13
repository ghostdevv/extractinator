export interface ParsedSvelteFile {
	componentName: string

	/**
	 * Path to the file containing the source code.
	 */
	file: string

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
	/** Name of the variable belongs to. */
	name: string

	/** The typescript type of the variable. */
	type: string

	comment?: TSDocComment
}

export interface SlotBit extends Omit<Bit, 'type'> {
	props: Bit[]
}
