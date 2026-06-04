import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

const LOGO_PATH = path.join(process.cwd(), "public/logo/wgg.png");

let logoDataUrl: string | null = null;

export async function getBrandLogoDataUrl(): Promise<string> {
  if (!logoDataUrl) {
    const buffer = await readFile(LOGO_PATH);
    logoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return logoDataUrl;
}

export function renderBrandIcon(size: number, logoSrc: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={Math.round(size * 0.92)}
          height={Math.round(size * 0.92)}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { width: size, height: size }
  );
}
