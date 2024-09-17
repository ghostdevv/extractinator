import { extractinator } from '../src/exports/package'
import { describe, expect, it, vi } from 'vitest'
import { join } from 'node:path'
import { dirname } from 'desm'

const __dirname = dirname(import.meta.url)
const TEST_FILES_DIR = join(__dirname, './test-files')
const results = await extractinator({ input: TEST_FILES_DIR })

function getResult(fileName: string) {
	return results.find((result) => result.fileName == fileName)
}

function snapshot(fileName: string) {
	return join(__dirname, `./__snapshots__/${fileName}.doc.json`)
}

describe('extract', () => {
	it('should have extracted', () => {
		expect(results).toBeTruthy()
		expect(results.length).toBeGreaterThan(1)
	})

	it('Events.svelte', () => {
		const result = getResult('Events.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('Events.svelte'))
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'Events.svelte'))
	})

	it('Example.svelte', () => {
		const result = getResult('Example.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('Example.svelte'))
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'Example.svelte'))
	})

	it('IntersectProps.svelte', () => {
		const result = getResult('IntersectProps.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(
			snapshot('IntersectProps.svelte'),
		)
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'IntersectProps.svelte'))
	})

	it('Script.svelte', () => {
		const result = getResult('Script.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('Script.svelte'))
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'Script.svelte'))
	})

	it('Skeleton.svelte', () => {
		const result = getResult('Skeleton.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('Skeleton.svelte'))
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'Skeleton.svelte'))
	})

	it('Slot.svelte', () => {
		const result = getResult('Slot.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('Slot.svelte'))
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'Slot.svelte'))
	})

	it('Slots.svelte', () => {
		const result = getResult('Slots.svelte')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('Slots.svelte'))
		expect(result?.type).toBe('svelte')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'Slots.svelte'))
	})

	it('kitchenSink.ts', () => {
		const result = getResult('kitchenSink.ts')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('kitchenSink.ts'))
		expect(result?.type).toBe('ts')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'kitchenSink.ts'))
	})

	it('demo.d.ts', () => {
		const result = getResult('demo.d.ts')

		expect(result).toBeTruthy()
		expect(JSON.stringify(result, null, 2)).toMatchFileSnapshot(snapshot('nested/demo.d.ts'))
		expect(result?.type).toBe('ts')
		// expect(result?.filePath).toBe(join(TEST_FILES_DIR, 'nested/demo.d.ts'))
	})
})
