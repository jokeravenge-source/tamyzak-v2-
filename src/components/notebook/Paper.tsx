import { memo } from "react";
import {
  NotebookItem,
  NotebookPage,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PAPER_COLORS,
  shapePath,
  smoothPath,
  strokePoints,
  TextItem,
  wrapText,
} from "./model";
import { stickerById } from "./stickers";

export const TEXT_FONT = "Georgia, 'Times New Roman', serif";
let measuring: CanvasRenderingContext2D | null;
export function textLines(item: TextItem): string[] {
  if (measuring === undefined)
    measuring = document.createElement("canvas").getContext("2d");
  if (measuring)
    measuring.font = `${item.italic ? "italic " : ""}${item.bold ? "bold " : ""}${item.fontSize}px ${TEXT_FONT}`;
  const padding = item.kind === "sticky" ? 24 : 4;
  return wrapText(item.text, Math.max(12, item.w - padding * 2), (text) =>
    measuring
      ? measuring.measureText(text).width
      : text.length * item.fontSize * 0.55,
  );
}

export const PaperBackground = memo(function PaperBackground({
  page,
  prefix,
}: {
  page: NotebookPage;
  prefix: string;
}) {
  const pattern = `${prefix}-pattern`;
  return (
    <>
      <defs>
        <pattern
          id={pattern}
          width={page.style === "dotted" ? 24 : 28}
          height={page.style === "dotted" ? 24 : 28}
          patternUnits="userSpaceOnUse"
        >
          {page.style === "lined" && (
            <path
              d="M0 27.5H28"
              fill="none"
              stroke="#CFC9C0"
              strokeWidth=".7"
            />
          )}
          {page.style === "grid" && (
            <path
              d="M28 0H0V28"
              fill="none"
              stroke="#D2CCC2"
              strokeWidth=".7"
            />
          )}
          {page.style === "dotted" && (
            <circle cx="12" cy="12" r="1" fill="#C9C0B3" />
          )}
        </pattern>
        <pattern
          id={`${prefix}-texture`}
          width="9"
          height="11"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="2" r=".5" fill="#A89D8C" opacity=".08" />
          <circle cx="6" cy="8" r=".4" fill="#A89D8C" opacity=".06" />
        </pattern>
        <filter
          id={`${prefix}-shadow`}
          x="-20%"
          y="-20%"
          width="150%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="5"
            stdDeviation="6"
            floodColor="#665E4D"
            floodOpacity=".12"
          />
        </filter>
      </defs>
      <rect
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        fill={PAPER_COLORS[page.color]}
      />
      <rect
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        fill={`url(#${prefix}-texture)`}
        pointerEvents="none"
      />
      {page.style !== "plain" && (
        <rect
          x="40"
          y="46"
          width={PAGE_WIDTH - 80}
          height={PAGE_HEIGHT - 92}
          fill={`url(#${pattern})`}
          pointerEvents="none"
        />
      )}
    </>
  );
});

export const ItemView = memo(function ItemView({
  item,
  prefix,
  hiddenText = false,
  interactive = false,
}: {
  item: NotebookItem;
  prefix: string;
  hiddenText?: boolean;
  interactive?: boolean;
}) {
  const clip = `${prefix}-${item.id}`;
  const textItem = item.kind === "text" || item.kind === "sticky" ? item : null;
  const padding = item.kind === "sticky" ? 24 : 4;
  return (
    <g
      transform={`translate(${item.x} ${item.y}) rotate(${item.rotation} ${item.w / 2} ${item.h / 2})`}
      opacity={item.opacity}
      data-item-id={item.id}
      data-item-kind={item.kind}
      style={interactive ? { cursor: "inherit" } : undefined}
    >
      {item.kind === "sticker" && (
        <image
          href={stickerById.get(item.stickerId)?.src}
          width={item.w}
          height={item.h}
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: interactive ? "visiblePainted" : "none" }}
        />
      )}
      {item.kind === "stroke" && (
        <path
          d={smoothPath(strokePoints(item))}
          fill="none"
          stroke={item.color}
          strokeWidth={item.size}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={
            item.brush === "highlighter"
              ? 0.34
              : item.brush === "pencil"
                ? 0.66
                : 1
          }
          style={{ pointerEvents: interactive ? "stroke" : "none" }}
        />
      )}
      {item.kind === "shape" && (
        <>
          {item.shape === "rectangle" ? (
            <rect
              width={item.w}
              height={item.h}
              rx="5"
              fill={item.fill}
              stroke={item.color}
              strokeWidth={item.size}
            />
          ) : item.shape === "circle" ? (
            <ellipse
              cx={item.w / 2}
              cy={item.h / 2}
              rx={item.w / 2}
              ry={item.h / 2}
              fill={item.fill}
              stroke={item.color}
              strokeWidth={item.size}
            />
          ) : (
            <path
              d={shapePath(item.shape, item.w, item.h, item.flipX, item.flipY)}
              fill={
                item.shape === "heart" || item.shape === "star"
                  ? item.fill
                  : "none"
              }
              stroke={item.color}
              strokeWidth={item.size}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {interactive && (
            <rect width={item.w} height={item.h} fill="transparent" />
          )}
        </>
      )}
      {textItem && (
        <>
          {item.kind === "sticky" && (
            <>
              <rect
                width={item.w}
                height={item.h}
                rx="2"
                fill={textItem.background}
                filter={`url(#${prefix}-shadow)`}
              />
              <rect width={item.w} height="13" fill="#FFF" opacity=".13" />
              <path
                d={`M${item.w - 20} ${item.h} l20 -20 v20Z`}
                fill="#9E8864"
                opacity=".12"
              />
            </>
          )}
          <defs>
            <clipPath id={clip}>
              <rect
                x={padding}
                y={padding}
                width={Math.max(1, item.w - padding * 2)}
                height={Math.max(1, item.h - padding * 2)}
              />
            </clipPath>
          </defs>
          {!hiddenText && (
            <text
              clipPath={`url(#${clip})`}
              x={
                textItem.align === "center"
                  ? item.w / 2
                  : textItem.align === "right"
                    ? item.w - padding
                    : padding
              }
              y={padding + textItem.fontSize}
              fill={textItem.color}
              fontFamily={TEXT_FONT}
              fontSize={textItem.fontSize}
              fontWeight={textItem.bold ? 700 : 400}
              fontStyle={textItem.italic ? "italic" : "normal"}
              textAnchor={
                textItem.align === "center"
                  ? "middle"
                  : textItem.align === "right"
                    ? "end"
                    : "start"
              }
            >
              {textLines(textItem).map((line, n) => (
                <tspan
                  key={n}
                  x={
                    textItem.align === "center"
                      ? item.w / 2
                      : textItem.align === "right"
                        ? item.w - padding
                        : padding
                  }
                  dy={n ? textItem.fontSize * 1.4 : 0}
                >
                  {line || "\u00A0"}
                </tspan>
              ))}
            </text>
          )}
          {interactive && (
            <rect width={item.w} height={item.h} fill="transparent" />
          )}
        </>
      )}
    </g>
  );
});

export function PageThumbnail({
  page,
  prefix,
}: {
  page: NotebookPage;
  prefix: string;
}) {
  return (
    <svg viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`} aria-hidden="true">
      <PaperBackground page={page} prefix={prefix} />
      {page.items.map((item) => (
        <ItemView key={item.id} item={item} prefix={prefix} />
      ))}
    </svg>
  );
}
