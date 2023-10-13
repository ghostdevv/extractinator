import { defineConfig } from 'tsup'

export default defineConfig({
	splitting: false,
	sourcemap: false,
	clean: true,
	dts: true,
	keepNames: true,
	target: 'esnext',
	format: ['esm'],
	entryPoints: ['src/cli.ts'],
})
