# Zig Support Badge

Zig evolves quickly, and a library's compatibility can be hard to understand at a glance. A typical badge usually communicates a single status or version, while a compatibility note in a README is easy to miss or let become outdated.

Zig Support Badge turns a list of supported Zig versions into a compact SVG compatibility table that can be embedded directly in a README.

Put the supported versions in the request path, and the service returns the badge.

## Usage

Add the Zig versions your project supports to the URL and embed the badge in Markdown:

```markdown
![Zig support](https://zig-support.dkx215417.workers.dev/master/0.16.0/0.15.2/badge.svg)
```

You can also make the badge clickable, for example by linking it to the Zig download page:

```markdown
[![Zig support](https://zig-support.dkx215417.workers.dev/master/0.16.0/0.15.2/badge.svg)](https://ziglang.org/download/)
```

[![Zig support](https://zig-support.dkx215417.workers.dev/master/0.16.0/0.15.2/badge.svg)](https://ziglang.org/download/)

`master` is always shown first. Release versions must use the exact `x.y.z` format. Versions are deduplicated and sorted from newest to oldest, invalid path segments are ignored, and at most ten supported versions are displayed.

The final `else: no` row makes it explicit that versions not listed above are unsupported.

## Self-hosting

The public endpoint is hosted on Cloudflare Workers on a best-effort basis. Self-hosting is recommended for projects that need reliable availability.

## License

[MIT](LICENSE)
