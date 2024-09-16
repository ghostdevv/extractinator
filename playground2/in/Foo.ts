/**
 * This is a comment about Foo.  Foo is super great.
 * @example
 * const foo = new Foo() // 👍
 */
export class Foo {
	/**
	 * This is a comment a about bar.  Bar is great.
	 * @example
	 * const foo = new Foo()
	 * foo.bar() // 'baz'
	 */
	public bar(): 'baz' {
		return 'baz'
	}
}

// Output
// {
// 	"type": "ts",
// 	"fileName": "Foo.ts",
// 	"filePath": "playground2/in/Foo.ts",
// 	"exports": [
// 	  {
// 		"name": "Foo",
// 		"type": "Foo",
// 		"isDefaultExport": false,
// 		"comment": {
// 		  "raw": "/**\n * This is a comment about Foo. Foo is super great.\n *\n * @example\n *\n * const foo = new Foo() // 👍\n */",
// 		  "summary": "This is a comment about Foo. Foo is super great.",
// 		  "examples": [
// 			{
// 			  "name": "const foo = new Foo() // 👍",
// 			  "content": ""
// 			}
// 		  ]
// 		}
// 	  }
// 	]
// }
