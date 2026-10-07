"use client";
import { useEffect, useState } from "react";
// qrcode does not ship TypeScript declarations in this project.
// @ts-expect-error -- the package is used through its documented runtime API.
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

/**
 * ✅ REWRITTEN: no longer uses `qrcode.react`. That library's v3→v4 API change
 * (includeMargin → marginSize) was one source of scan failures, and relying on
 * a *different* QR engine than the one used for the downloaded PDF meant two
 * separate places things could go wrong.
 *
 * This now uses the exact same `qrcode` package (already installed for the PDF
 * generator in lib/prescriptionPdf.ts) to build a PNG data URL, so the on-screen
 * QR and the PDF QR are produced by identical code — same quiet zone, same
 * error-correction level, same everything.
 */
export default function QRCodeDisplay({ value, size = 200 }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setFailed(false);

    QRCode.toDataURL(value, {
      margin: 4, // ✅ required quiet zone — same value used in the PDF generator
      width: size * 2, // render at 2x so it stays crisp on high-DPI phone screens
      errorCorrectionLevel: "M", // "M" keeps modules a bit larger/less dense than "H" for the same payload
    })
      .then((url: string) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
        style={{ width: size + 24, height: size + 24 }}
      >
        {failed ? (
          <p className="px-2 text-center text-xs text-rose-500">Failed to generate QR code</p>
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="Prescription QR code" width={size} height={size} className="rounded-lg" />
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        )}
      </div>
      <p className="text-[10px] font-mono text-slate-500 break-all text-center">{value}</p>
    </div>
  );
}