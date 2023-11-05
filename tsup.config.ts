import { defineConfig } from 'tsup'

export default defineConfig([
	{
		splitting: false,
		sourcemap: false,
		clean: true,
		dts: true,
		keepNames: true,
		target: 'esnext',
		format: ['esm', 'cjs'],
		entryPoints: ['src/exports/package.ts'],
		shims: true,
	},
	{
		splitting: false,
		sourcemap: false,
		clean: true,
		dts: false,
		keepNames: true,
		target: 'esnext',
		format: ['esm'],
		entryPoints: ['src/exports/cli.ts'],
	},
])
