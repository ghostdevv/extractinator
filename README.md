# Extractinator

A work in progress cli tool for extracting type information & tsdoc from Svelte & TS/JS files.

## Progress

- [ ] Extract from Svelte Files
    - [ ] CSS Props
    - [ ] Component comment
    - [x] Props
    - [x] Module exports
    - [x] Events
    - [x] Slots
- [ ] Configure Svelte Version
- [ ] Extract from TS/JS Files

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
	export const state = writable<string | number | boolean>(true)
</script>

<script lang="ts">
	/**
	 * Let the thing know whether it's on earth
	 */
	export let isOnEarth: boolean
</script>

<button on:click>
	Is On Earth: {isOnEarth}
</button>

<div>
	<slot {isOnEarth} />
	<slot name="test" />
</div>
```

Output:

```json
{
  "fileName": "KitchenSink.svelte",
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
  "variables": [
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