# Extractinator

A tool to extract the api information from Svelte and TS/JS files. Extract slots, events, module exports, props, and css props all with parsed tsdoc comments.

<br>

## Usage

Install

`pnpm i -D extractinator`

Extract

`pnpm extractinator extract <input_folder> <output_folder>`

<br>

## Requirements

| Tool   | Version                           |
| ------ | --------------------------------- |
| Node   | v18 >=                            |
| TS     | 5.3 (other v5 may work, untested) |
| Svelte | v4                                |

<br>

## CLI

```bash
$ extractinator --help

  Usage
    $ extractinator <command> [options]

  Available Commands
    extract    Extract the nator

  For more info, run any command with the `--help` flag
    $ extractinator extract --help

  Options
    --version  -v   Displays current version
    --help     -h   Displays this message
    --quiet    -q   Disabled all logging
    --verbose	    Enables verbose logging
```

<br>

## JS API

```ts
import { extractinator } from 'extractinator'

interface ExtractinatorOptions {
	input: string
	tsdocConfigPath?: string
}

const results = await extractinator({
	// Path to the input file(s).  Will recursively search for svelte and ts files.
	input: './playground',

	// (optional) Path to a custom tsdoc config.  This will be merged with the internal config.
	tsdocConfigPath: './tsdoc.json',
})
```

<br>

## Example

Input:

`Example.svelte`

````html
<!-- 
	@component
	Example Svelte Component

	@example Simple
	```html
	<Example />
	```

	@example Slots
	```html
	<Example>
		<div slot="test">Test</div>
	</Example>
-->

<script context="module">
	import { writable } from 'svelte/store'

	/**
	 * The state the component is in
	 * @default true
	 */
	export const state = (writable < string) | number | (boolean > true)
</script>

<script lang="ts">
	/**
	 * Let the thing know whether it's on earth
	 */
	export let isExample: boolean
</script>

<button on:click> Is an example: {isExample} </button>

<div>
	<slot {isExample} />
	<slot name="test" />
</div>
````

Output:

`Example.svelte.doc.json`

````json
{
	"type": "svelte",
	"fileName": "Example.svelte",
	"filePath": "playground/Example.svelte",
	"comment": {
		"raw": "/**\n * Example Svelte Component\n *\n * @example\n *\n * Simple\n * ```html\n * <Example />\n * ```\n *\n * @example\n *\n * Slots ```html <Example> <div slot=\"test\">Test</div> </Example>\n */",
		"summary": "Example Svelte Component",
		"examples": [
			{
				"name": "Simple",
				"content": "```html\n<Example />\n```"
			},
			{
				"name": "Slots",
				"content": "```html\n<Example>\n\t<div slot=\"test\">Test</div>\n</Example>"
			}
		]
	},
	"componentName": "Example",
	"props": [
		{
			"comment": {
				"raw": "/**\n * Let the thing know whether it's an example or not.\n */",
				"summary": "Let the thing know whether it's an example or not."
			},
			"name": "isExample",
			"type": "boolean"
		}
	],
	"events": [
		{
			"name": "click",
			"type": "HTMLElementEventMap"
		}
	],
	"slots": [
		{
			"name": "default",
			"props": [
				{
					"name": "isExample",
					"type": "boolean"
				}
			]
		},
		{
			"name": "test",
			"props": []
		}
	],
	"exports": [
		{
			"comment": {
				"raw": "/**\n * The state the component is in\n *\n * @default\n *\n * true\n */",
				"summary": "The state the component is in",
				"defaultValue": "true"
			},
			"name": "state",
			"type": "Writable<string | number | boolean>"
		}
	]
}
````
