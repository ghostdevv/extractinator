# extractinator

## 0.4.0

### Minor Changes

-   feat: add `type` field to output ([`31495390342edf3ec1517c8c0cc62da08c0be625`](https://github.com/ghostdevv/extractinator/commit/31495390342edf3ec1517c8c0cc62da08c0be625))

-   feat: verbose logging mode ([#28](https://github.com/ghostdevv/extractinator/pull/28))

### Patch Changes

-   fix: trim comment outputs ([#28](https://github.com/ghostdevv/extractinator/pull/28))

-   breaking: update to ts 5.3 and outline minimum dep versions ([`d01fadd2c92f5211b7a6caf4ad0ee0975a9209d3`](https://github.com/ghostdevv/extractinator/commit/d01fadd2c92f5211b7a6caf4ad0ee0975a9209d3))

-   fix: skip files with no exports ([#28](https://github.com/ghostdevv/extractinator/pull/28))

-   fix: filter out \_\_index: any props ([#28](https://github.com/ghostdevv/extractinator/pull/28))

-   fix: not deleting temp folders correctly ([#28](https://github.com/ghostdevv/extractinator/pull/28))

## 0.3.1

### Patch Changes

-   fix: don't error on unsupported files ([`c97b74f`](https://github.com/ghostdevv/extractinator/commit/c97b74f4303a784b688465e2b9521bdd60af6448))

-   fix: handle source .d.ts files ([`c8f7a50`](https://github.com/ghostdevv/extractinator/commit/c8f7a5007ed6afc6526fd3e881b7545612b8acb2))

## 0.3.0

### Minor Changes

-   feat: --quiet cli option ([`d4fd44e`](https://github.com/ghostdevv/extractinator/commit/d4fd44e1cb143d747fb201c9b663372a944def0c))

-   feat: include all modifier tags ([`7ed59d2`](https://github.com/ghostdevv/extractinator/commit/7ed59d2da76f4da8b6f0ff58255c04d029281f34))

### Patch Changes

-   fix: support nested paths ([`57d1270`](https://github.com/ghostdevv/extractinator/commit/57d1270122078b9a461496eec19507e0e75d5c37))

-   fix: logs not showing on cli by default ([`e0ba541`](https://github.com/ghostdevv/extractinator/commit/e0ba541b33b40b82d13d22c8d4dfb8aae689cca9))

-   fix: cleanup .extractinator dir if it's unused ([`3b23557`](https://github.com/ghostdevv/extractinator/commit/3b235577c9a2b8b40e753ab129f351372c580a22))

-   fix: DEBUG mode not refreshing dts files ([`c6a1b86`](https://github.com/ghostdevv/extractinator/commit/c6a1b864c8c4bb11501e36e5b4c2a01af0b439e2))

-   breaking: examples are now `{ name, content }` instead of `string` ([`e3083a8`](https://github.com/ghostdevv/extractinator/commit/e3083a87673554b682d802ac4e2a3e24e4e7921d))

-   fix: incorrectly trimming comments ([`e672f55`](https://github.com/ghostdevv/extractinator/commit/e672f55f53254c0cbedac0f903d249ac4260bd5a))

-   fix: filter out junk ([`07d27c8`](https://github.com/ghostdevv/extractinator/commit/07d27c808374162e0710aca74bb15f2ee3c5b2af))

## 0.2.1

### Patch Changes

-   fix: `__VERSION__` is not defined error ([`922d20f`](https://github.com/ghostdevv/extractinator/commit/922d20f206bb437a25ce01fbb7e00c7795497a30))

## 0.2.0

### Minor Changes

-   feat: parse the component comment ([#13](https://github.com/ghostdevv/extractinator/pull/13))

### Patch Changes

-   update README with better information ([#8](https://github.com/ghostdevv/extractinator/pull/8))

-   breaking: change variables to exports in parsed svelte files ([#12](https://github.com/ghostdevv/extractinator/pull/12))

-   fix: include node shebang ([`149fde0`](https://github.com/ghostdevv/extractinator/commit/149fde051d4bece287e7b11d15ff91b4c95de146))

## 0.1.0

### Minor Changes

-   initial release ([#2](https://github.com/ghostdevv/extractinator/pull/2))
