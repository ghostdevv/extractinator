# Extractinator Contributing Guide

## Dependencies

You need to install pnpm, which you can do with `npm install pnpm@8 --global`

## Testing Changes

While developing we use the example files in [`playground`](./playground/), and use the command `pnpm playground` to run these through the CLI.

## Sending PRs

### Coding style

There are a few guidelines we follow:

- Internal variables are written with `snake_case` while external APIs are written with `camelCase`

- Provide a single object as the argument to public APIs. This object can have multiple properties

## Generating changelogs

For changes to be reflected in package changelogs, run `pnpm changeset` and follow the prompts. You need to do this for any changes to the public api.

## Releases

The [Changesets GitHub action](https://github.com/changesets/action#with-publishing) will create and update a PR that applies changesets and publishes new versions of changed packages to npm.

## Thanks

Based on the [SvelteKit Contributing Guide](https://github.com/sveltejs/kit/blob/ce4fd764e271b1a461979dfaf9698af6f36e3714/CONTRIBUTING.md)