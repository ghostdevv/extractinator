import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig([
	{
		splitting: false,
		sourcemap: false,
		clean: true,
		dts: true,
		target: 'es2022',
		format: ['esm', 'cjs'],
		entryPoints: ['src/exports/package.ts'],
		shims: true,
	},
	{
		splitting: false,
		sourcemap: false,
		clean: true,
		dts: false,
		target: 'es2022',
		format: ['esm'],
		entryPoints: ['src/exports/cli.ts'],
		define: {
			__VERSION__: `'${pkg.version}'`,
		},
	},
])
