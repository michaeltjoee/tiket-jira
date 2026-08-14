import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const INK = "#15202B";
const PAPER = "#E4EAF0";
const GAP = "#8F4632";
const S = 11;
const O = 2;

const cell = (x: number, y: number, w: number, h: number, fill: string) => ({
  position: "absolute" as const,
  left: O + x * S,
  top: O + y * S,
  width: w * S,
  height: h * S,
  background: fill,
});

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: INK,
        position: "relative",
      }}
    >
      <div style={cell(6, 2, 6, 1, PAPER)} />
      <div style={cell(4, 3, 10, 1, PAPER)} />
      <div style={cell(3, 4, 2, 1, PAPER)} />
      <div style={cell(7, 4, 3, 1, PAPER)} />
      <div style={cell(10, 4, 2, 1, GAP)} />
      <div style={cell(12, 4, 2, 1, PAPER)} />
      <div style={cell(3, 5, 12, 1, PAPER)} />
      <div style={cell(4, 6, 10, 1, PAPER)} />
      <div style={cell(3, 7, 12, 1, PAPER)} />
      <div style={cell(2, 8, 14, 1, PAPER)} />
      <div style={cell(2, 9, 13, 1, PAPER)} />
      <div style={cell(3, 10, 12, 1, PAPER)} />
      <div style={cell(3, 11, 11, 1, PAPER)} />
      <div style={cell(4, 12, 9, 1, PAPER)} />
    </div>,
    size,
  );
}
