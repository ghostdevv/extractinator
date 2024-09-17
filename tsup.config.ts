import { spawn } from 'child_process'
import { defineConfig } from 'tsup'
import pkg from './package.json'

export default defineConfig(({ watch }) => [
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
		onSuccess: async () => {
			if (watch) {
				console.log('Build successful. Running playground...')

				return new Promise((resolve, reject) => {
					const child = spawn('pnpm', ['playground'], { stdio: 'inherit', shell: true })

					child.on('close', (code) => {
						if (code === 0) {
							console.log('Playground script completed successfully.')
							resolve()
						} else {
							console.error(`Playground script exited with code ${code}`)
							reject(new Error(`Playground script exited with code ${code}`))
						}
					})

					child.on('error', (error) => {
						console.error('Failed to start playground script:', error)
						reject(error)
					})
				})
			}
		},
	},
])
