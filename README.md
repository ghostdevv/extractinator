# Extractinator

A tool to extract the api information from Svelte and TS/JS files. Extract slots, events, module exports, props, and css props all with parsed tsdoc comments.

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
    -v, --version    Displays current version
    -h, --help       Displays this message
```

### extract

```bash
$ extractinator extract --help

  Description
    Extract the nator

  Usage
    $ extractinator extract <input> <output> [options]

  Options
    --tsdoc-config    Path to a custom tsdoc.json
    -h, --help        Displays this message
```

## JS API

```ts
import { extractinator } from 'extractinator'

interface ExtractinatorOptions {
	tsdocConfigPath?: string
	input: string
}

const results = await extractinator({
	// OPTIONAL
	// path to a custom tsdoc config - this will be merged with the internal config
	tsdocConfigPath: './tsdoc.json',

	// REQUIRED
	// Path to the input file(s), will recursively look in the directory for .svelte, .ts, and .js files
	input: './playground',
})
```

## Example

Input:

```html
<!-- 
	@component
	Kitchen Sink Svelte Component
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
	export let isOnEarth: boolean
</script>

<button on:click> Is On Earth: {isOnEarth} </button>

<div>
	<slot {isOnEarth} />
	<slot name="test" />
</div>
```

Output:

```json
{
	"fileName": "KitchenSink.svelte",
	"filePath": "/workspace/extractinator/playground/KitchenSink.svelte",
	"comment": {
		"raw": "/**\n * Kitchen Sink Svelte Component\n */\n",
		"summary": "Kitchen Sink Svelte Component"
	},
	"componentName": "KitchenSink",
	"props": [
		{
			"comment": {
				"raw": "/**\n * Let the thing know whether it's on earth\n */\n",
				"summary": "Let the thing know whether it's on earth"
			},
			"name": "isOnEarth",
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
					"name": "isOnEarth",
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
				"raw": "/**\n * The state the component is in\n *\n * @default\n *\n * true\n */\n",
				"summary": "The state the component is in",
				"defaultValue": "true"
			},
			"name": "state",
			"type": "Writable<string | number | boolean>"
		}
	]
}
```
