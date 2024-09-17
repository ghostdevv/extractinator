/*
 * Color logging functions with ridiculously short names that nobody should ever use.
 * I just like them.
 */

import type { ParsedSvelteFile, ParsedTSFile } from '../types'
import { DocExcerpt, type DocNode } from '@microsoft/tsdoc'
import c from 'chalk'

let _verbose = false
let _quiet = false

export function setLogLevel(level: 'quiet' | 'info' | 'verbose') {
	_verbose = level === 'verbose'
	_quiet = level === 'quiet'
}

/** console.log */
export function l(...args: unknown[]) {
	!_quiet && console.log(...args)
}

/** console.warn */
export function warn(...args: unknown[]) {
	!_quiet && console.warn(...args)
}

/** {@link l log} verbose - only logs when {@link _verbose} is `true` */
export function lv(...args: unknown[]) {
	_verbose && l(...args)
}

/** chalk.red */
export function r(...args: unknown[]) {
	return c.red(...args)
}

/** chalk.green */
export function g(...args: unknown[]) {
	return c.green(...args)
}

/** chalk.blue */
export function b(...args: unknown[]) {
	return c.blue(...args)
}

/** chalk.yellow */
export function y(...args: unknown[]) {
	return c.yellow(...args)
}

/** chalk.magenta */
export function m(...args: unknown[]) {
	return c.magenta(...args)
}

const orange = c.hex('#cc6630')
/** orange chalk.hex('#cc6630') */
export function o(...args: unknown[]) {
	return orange(...args)
}

const pink = c.hex('#eaa')
/** pink chalk.hex('#eaa') */
export function p(...args: unknown[]) {
	return pink(...args)
}

const lightGreen = c.hex('#aea')
/** lightGreen chalk.hex('#aea') */
export function lg(...args: unknown[]) {
	return lightGreen(...args)
}

/** chalk.dim */
export function dim(...args: unknown[]) {
	return c.dim(...args)
}

/** chalk.dim */
export function d(...args: unknown[]) {
	return c.dim(...args)
}

/** chalk.bold */
export function bd(...args: unknown[]) {
	return c.bold(...args)
}

/**
 * Logs an empty line.
 */
export function n(
	/**
	 * Number of empty lines to log.
	 * @default 1
	 */
	count = 1,
) {
	if (!_quiet) {
		for (let i = 0; i < count; i++) console.log()
	}
}

/**
 * {@link n Logs} an empty line when {@link _verbose} is `true`.
 */
export function nv(count = 1) {
	_verbose && n(count)
}

/**
 * Pretty prints a {@link DocNode} tree to the console.
 */
export function logTSDocTree(docNode: DocNode, outputLines: string[] = [], indent: string = '') {
	let dumpText: string = ''
	if (docNode instanceof DocExcerpt) {
		const content: string = docNode.content.toString()
		dumpText += dim(`${indent}* ${docNode.excerptKind}: `) + b(JSON.stringify(content))
	} else {
		dumpText += `${indent}- ${docNode.kind}`
	}
	outputLines.push(dumpText)

	for (const child of docNode.getChildNodes()) {
		logTSDocTree(child, outputLines, indent + '  ')
	}

	return outputLines
}

const SVELTE_EXPORTS = ['props', 'slots', 'events', 'exports'] as const

/**
 * Pretty prints a {@link ParsedSvelteFile} to the console.
 */
export function logSvelteFile(file: ParsedSvelteFile) {
	lv(o(file.fileName))
	let i = 0
	for (const kind of SVELTE_EXPORTS) {
		i++

		const count = file[kind].length
		const is_last = i === SVELTE_EXPORTS.length
		const branch_char = is_last ? ' └' : ' ├'
		const plural = count === 1 ? kind.slice(0, -1) : kind

		if (count) {
			lv(d(branch_char, g(count), plural))
		}
	}
}

/**
 * Pretty prints a {@link ParsedFile} to the console.
 */
export function logTsFile(file: ParsedTSFile) {
	lv(b(file.fileName))

	const count = file.exports.length

	for (let i = 0; i < count; i++) {
		const is_last = i === count - 1
		const branch_char = is_last ? ' └' : ' ├'

		const { name } = file.exports[i]

		lv(d(g(branch_char), name))
	}
}

export const SEP = '\x1b[90m│\x1b[39m '
