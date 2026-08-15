function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isValidVersion(value: string): boolean {
  if (value === "master") return true;

  return /^\d+\.\d+\.\d+$/.test(value);
}

function parseVersion(version: string): [number, number, number] {
  const [major, minor, patch] = version.split(".").map(Number);
  return [major, minor, patch];
}

function compareVersionsDesc(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  for (let i = 0; i < 3; i++) {
    if (va[i] !== vb[i]) {
      return vb[i] - va[i];
    }
  }

  return 0;
}

function normalizeVersions(pathname: string): string[] {
  const raw = pathname
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);

  const seen = new Set<string>();
  const versions: string[] = [];
  let hasMaster = false;

  for (const item of raw) {
    if (!isValidVersion(item)) continue;

    if (item === "master") {
      hasMaster = true;
      continue;
    }

    if (seen.has(item)) continue;
    seen.add(item);
    versions.push(item);
  }

  versions.sort(compareVersionsDesc);

  const result = hasMaster ? ["master", ...versions] : versions;
  return result.slice(0, 10);
}

function makeZigBadge(versions: string[]): string {
  const headerHeight = 26;
  const rowHeight = 22;

  const leftWidth = 76;
  const rightWidth = 42;
  const width = leftWidth + rightWidth;

  const rows = [
    ...versions.map((version) => ({
      version,
      supported: true,
    })),
    {
      version: "else",
      supported: false,
    },
  ];

  const height = headerHeight + rows.length * rowHeight;

  const backgrounds = rows
    .map(({ supported }, index) => {
      const y = headerHeight + index * rowHeight;

      return `
        <rect
          x="0"
          y="${y}"
          width="${leftWidth}"
          height="${rowHeight}"
          fill="url(#left-row)"
        />
        <rect
          x="${leftWidth}"
          y="${y}"
          width="${rightWidth}"
          height="${rowHeight}"
          fill="url(#${supported ? "green-row" : "red-row"})"
        />
      `;
    })
    .join("");

  const texts = rows
    .map(({ version, supported }, index) => {
      const baseline = headerHeight + index * rowHeight + 15;
      const status = supported ? "yes" : "no";

      return `
        <!-- shadow -->
        <text
          x="${leftWidth / 2 + 0.5}"
          y="${baseline + 0.7}"
          text-anchor="middle"
          fill="#000"
          fill-opacity=".32"
        >${escapeXml(version)}</text>

        <text
          x="${leftWidth + rightWidth / 2 + 0.5}"
          y="${baseline + 0.7}"
          text-anchor="middle"
          fill="#000"
          fill-opacity=".32"
        >${status}</text>

        <!-- foreground -->
        <text
          x="${leftWidth / 2}"
          y="${baseline}"
          text-anchor="middle"
        >${escapeXml(version)}</text>

        <text
          x="${leftWidth + rightWidth / 2}"
          y="${baseline}"
          text-anchor="middle"
        >${status}</text>
      `;
    })
    .join("");

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  role="img"
  aria-label="Zig support"
>
  <title>Zig support</title>

  <defs>
    <linearGradient id="left-row" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5f5f5f"/>
      <stop offset="100%" stop-color="#4f4f4f"/>
    </linearGradient>

    <linearGradient id="green-row" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#57d126"/>
      <stop offset="100%" stop-color="#45bd17"/>
    </linearGradient>

    <linearGradient id="red-row" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dd6751"/>
      <stop offset="100%" stop-color="#ca5643"/>
    </linearGradient>

    <linearGradient id="header-row" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6a6a6a"/>
      <stop offset="100%" stop-color="#5b5b5b"/>
    </linearGradient>

    <clipPath id="round">
      <rect
        width="${width}"
        height="${height}"
        rx="4"
      />
    </clipPath>
  </defs>

  <g clip-path="url(#round)">
    <rect
      width="${width}"
      height="${headerHeight}"
      fill="url(#header-row)"
    />

    ${backgrounds}
  </g>

  <!-- title shadow -->
  <text
    x="${width / 2 + 0.7}"
    y="18"
    text-anchor="middle"
    font-family="Arial,Helvetica,DejaVu Sans,sans-serif"
    font-size="12"
    font-weight="700"
    fill="#000"
    fill-opacity=".5"
  >Zig support</text>

  <!-- title -->
  <text
    x="${width / 2}"
    y="17.3"
    text-anchor="middle"
    font-family="Arial,Helvetica,DejaVu Sans,sans-serif"
    font-size="12"
    font-weight="700"
    fill="#fff"
  >Zig support</text>

  <g
    fill="#fff"
    font-family="Arial,Helvetica,DejaVu Sans,sans-serif"
    font-size="11"
    text-rendering="geometricPrecision"
  >
    ${texts}
  </g>
</svg>
`.trim();
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const versions = normalizeVersions(url.pathname);

    if (versions.length === 0) {
      return new Response("Usage: /master/0.16.0/0.15.2", {
        status: 400,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    const svg = makeZigBadge(versions);

    return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Cache-Control": "public, max-age=60",
		},
	});
  },
};
