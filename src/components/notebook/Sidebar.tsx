import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowUpRight,
  Bold,
  Circle,
  Eraser,
  Hand,
  Heart,
  Highlighter,
  Italic,
  MousePointer2,
  PenLine,
  Pencil,
  Search,
  Shapes,
  Sparkles,
  Square,
  Star,
  StickyNote,
  Type,
  X,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  INK_COLORS,
  NotebookItem,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  PASTELS,
  ShapeKind,
  Tool,
} from "./model";
import { STICKERS, StickerAsset } from "./stickers";

export const TOOLS: {
  id: Tool;
  label: string;
  icon: LucideIcon;
  key: string;
}[] = [
  { id: "select", label: "Select", icon: MousePointer2, key: "V" },
  { id: "pan", label: "Hand", icon: Hand, key: "H" },
  { id: "pen", label: "Pen", icon: PenLine, key: "P" },
  { id: "pencil", label: "Pencil", icon: Pencil, key: "B" },
  { id: "highlighter", label: "Highlighter", icon: Highlighter, key: "M" },
  { id: "eraser", label: "Eraser", icon: Eraser, key: "E" },
  { id: "text", label: "Text", icon: Type, key: "T" },
  { id: "sticky", label: "Sticky note", icon: StickyNote, key: "N" },
  { id: "shape", label: "Shapes", icon: Shapes, key: "S" },
];
export const SHAPES: { id: ShapeKind; label: string; icon: LucideIcon }[] = [
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "arrow", label: "Arrow", icon: ArrowUpRight },
  { id: "line", label: "Line", icon: Minus },
  { id: "heart", label: "Heart", icon: Heart },
  { id: "star", label: "Star", icon: Star },
];
export interface ToolSettings {
  color: string;
  size: number;
  opacity: number;
  stickyColor: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
  shape: ShapeKind;
  fill: string;
}

export function IconButton({
  label,
  children,
  active,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`nb-icon-button ${active ? "is-active" : ""} ${className}`}
      aria-label={label}
      aria-pressed={active}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
function Swatches({
  value,
  colors,
  onChange,
  label,
}: {
  value: string;
  colors: string[];
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div className="nb-swatches" role="group" aria-label={label}>
      {colors.map((color) => (
        <button
          key={color}
          className={`nb-swatch ${color.toLowerCase() === value.toLowerCase() ? "is-active" : ""}`}
          style={{ background: color }}
          aria-label={`${label} ${color}`}
          aria-pressed={color.toLowerCase() === value.toLowerCase()}
          title={color}
          onClick={() => onChange(color)}
        />
      ))}
      <label
        className="nb-custom-color"
        title={`Custom ${label.toLowerCase()}`}
      >
        <span>+</span>
        <input
          type="color"
          aria-label={`Custom ${label.toLowerCase()}`}
          value={value === "transparent" ? "#FFFFFF" : value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

export function Sidebar({
  open,
  tab,
  setTab,
  close,
  tool,
  setTool,
  settings,
  setSettings,
  selected,
  patchItem,
  addSticker,
  addSticky,
  editText,
}: {
  open: boolean;
  tab: "stickers" | "tools";
  setTab: (t: "stickers" | "tools") => void;
  close: () => void;
  tool: Tool;
  setTool: (t: Tool) => void;
  settings: ToolSettings;
  setSettings: (s: Partial<ToolSettings>) => void;
  selected?: NotebookItem;
  patchItem: (patch: Partial<NotebookItem>) => void;
  addSticker: (s: StickerAsset) => void;
  addSticky: () => void;
  editText: () => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const stickers = STICKERS.filter(
    (s) =>
      (category === "All" || s.category === category) &&
      s.name.toLowerCase().includes(search.toLowerCase()),
  );
  const text =
    selected?.kind === "text" || selected?.kind === "sticky" ? selected : null;
  const ink = selected && "color" in selected ? selected.color : settings.color;
  const colorChange = (color: string) => {
    setSettings({ color });
    if (selected && "color" in selected) patchItem({ color });
  };
  const textChange = (patch: Partial<ToolSettings>) => {
    setSettings(patch);
    if (text) patchItem(patch as Partial<NotebookItem>);
  };
  const opacity = selected?.opacity ?? settings.opacity;
  return (
    <>
      {open && (
        <button
          className="nb-drawer-backdrop"
          aria-label="Close sidebar"
          onClick={close}
        />
      )}
      <aside
        className={`nb-sidebar ${open ? "is-open" : ""}`}
        aria-label="Notebook supplies"
        aria-hidden={!open}
        {...(!open ? { inert: "" } : {})}
      >
        <div className="nb-sidebar-tabs" role="tablist" aria-label="Supplies">
          <button
            role="tab"
            aria-selected={tab === "stickers"}
            onClick={() => setTab("stickers")}
          >
            <Sparkles size={16} />
            Stickers
          </button>
          <button
            role="tab"
            aria-selected={tab === "tools"}
            onClick={() => setTab("tools")}
          >
            <PenLine size={16} />
            Tools
          </button>
          <IconButton
            label="Close supplies"
            className="nb-mobile-close"
            onClick={close}
          >
            <X size={17} />
          </IconButton>
        </div>
        <div
          className="nb-sidebar-scroll"
          role="tabpanel"
          aria-label={tab === "stickers" ? "Stickers" : "Tools"}
        >
          {tab === "stickers" ? (
            <>
              <div className="nb-section-title">
                <h2>A little something extra</h2>
                <span>{STICKERS.length}</span>
              </div>
              <p className="nb-muted nb-intro">
                Little details. A page that feels like you.
              </p>
              <label className="nb-search">
                <Search size={15} />
                <input
                  placeholder="Find a sticker…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search stickers"
                />
              </label>
              <div
                className="nb-categories"
                role="group"
                aria-label="Sticker categories"
              >
                {["All", "Study", "Decor", "Science", "Books"].map((c) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    className={category === c ? "is-active" : ""}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="nb-sticker-caption">
                <span>
                  {category === "All"
                    ? "THE STICKER DRAWER"
                    : category.toUpperCase()}
                </span>
                <small>tap or drag to add</small>
              </div>
              <div className="nb-sticker-grid">
                {stickers.map((s) => (
                  <button
                    key={s.id}
                    className="nb-sticker-tile"
                    aria-label={`Add ${s.name} sticker`}
                    title={`${s.name}${s.fromReference ? " · from your photo" : ""}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/x-notebook-sticker",
                        s.id,
                      );
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => addSticker(s)}
                  >
                    <img src={s.src} alt="" draggable={false} loading="lazy" />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
              {!stickers.length && (
                <p className="nb-empty-results">
                  No stickers found. Try another word.
                </p>
              )}
              <div className="nb-reference-note">
                <Heart size={13} /> 35 favorites from your photo
              </div>
            </>
          ) : (
            <>
              <div className="nb-section-title">
                <h2>Your creative toolkit</h2>
                <PenLine size={16} />
              </div>
              <p className="nb-muted nb-intro">
                A thought, a doodle, a little possibility.
              </p>
              <div className="nb-tool-grid">
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    aria-label={t.label}
                    aria-pressed={tool === t.id}
                    className={tool === t.id ? "is-active" : ""}
                    onClick={() => setTool(t.id)}
                  >
                    <t.icon size={19} />
                    <span>{t.label}</span>
                    <kbd>{t.key}</kbd>
                  </button>
                ))}
              </div>
              {(tool === "pen" ||
                tool === "pencil" ||
                tool === "highlighter" ||
                tool === "eraser" ||
                tool === "shape" ||
                selected?.kind === "stroke" ||
                selected?.kind === "shape") && (
                <div className="nb-panel-section">
                  <label className="nb-range-label" htmlFor="nb-stroke-size">
                    {tool === "eraser" ? "Eraser radius" : "Stroke size"}
                    <span>
                      {selected && "size" in selected
                        ? selected.size
                        : settings.size}{" "}
                      px
                    </span>
                  </label>
                  <input
                    id="nb-stroke-size"
                    type="range"
                    min="1"
                    max={tool === "eraser" ? 60 : 40}
                    value={
                      selected && "size" in selected
                        ? selected.size
                        : settings.size
                    }
                    onChange={(e) => {
                      const size = +e.target.value;
                      setSettings({ size });
                      if (selected && "size" in selected) patchItem({ size });
                    }}
                  />
                  <p className="nb-helper">
                    {tool === "eraser"
                      ? "Swipe over a drawing to remove its stroke."
                      : "Draw directly on your paper."}
                  </p>
                </div>
              )}
              {tool !== "pan" && tool !== "eraser" && (
                <div className="nb-panel-section">
                  <h3>INK COLOR</h3>
                  <Swatches
                    label="Ink color"
                    colors={
                      tool === "highlighter"
                        ? ["#E8CD75", ...PASTELS]
                        : INK_COLORS
                    }
                    value={ink}
                    onChange={colorChange}
                  />
                </div>
              )}
              {(tool === "text" || tool === "sticky" || text) && (
                <div className="nb-panel-section">
                  <h3>TEXT STYLE</h3>
                  <label className="nb-inline-label">
                    Font size
                    <input
                      type="number"
                      aria-label="Font size"
                      min="10"
                      max="120"
                      value={text?.fontSize ?? settings.fontSize}
                      onChange={(e) =>
                        textChange({
                          fontSize: Math.max(
                            10,
                            Math.min(120, +e.target.value || 10),
                          ),
                        })
                      }
                    />
                  </label>
                  <div className="nb-text-format">
                    <IconButton
                      label="Bold"
                      active={text?.bold ?? settings.bold}
                      onClick={() =>
                        textChange({ bold: !(text?.bold ?? settings.bold) })
                      }
                    >
                      <Bold size={16} />
                    </IconButton>
                    <IconButton
                      label="Italic"
                      active={text?.italic ?? settings.italic}
                      onClick={() =>
                        textChange({
                          italic: !(text?.italic ?? settings.italic),
                        })
                      }
                    >
                      <Italic size={16} />
                    </IconButton>
                    <span className="nb-divider" />
                    {(
                      [
                        { id: "left", icon: AlignLeft },
                        { id: "center", icon: AlignCenter },
                        { id: "right", icon: AlignRight },
                      ] as const
                    ).map((a) => (
                      <IconButton
                        key={a.id}
                        label={`Align ${a.id}`}
                        active={(text?.align ?? settings.align) === a.id}
                        onClick={() => textChange({ align: a.id })}
                      >
                        <a.icon size={16} />
                      </IconButton>
                    ))}
                  </div>
                  {text && (
                    <button className="nb-secondary-button" onClick={editText}>
                      <Type size={14} /> Edit text
                    </button>
                  )}
                </div>
              )}
              {(tool === "sticky" || selected?.kind === "sticky") && (
                <div className="nb-panel-section">
                  <h3>NOTE COLOR</h3>
                  <Swatches
                    label="Note color"
                    colors={PASTELS}
                    value={
                      selected?.kind === "sticky"
                        ? selected.background
                        : settings.stickyColor
                    }
                    onChange={(background) => {
                      setSettings({ stickyColor: background });
                      if (selected?.kind === "sticky")
                        patchItem({ background });
                    }}
                  />
                </div>
              )}
              {(tool === "shape" || selected?.kind === "shape") && (
                <div className="nb-panel-section">
                  <h3>SHAPE</h3>
                  <div className="nb-shape-grid">
                    {SHAPES.map((s) => (
                      <IconButton
                        key={s.id}
                        label={s.label}
                        active={
                          (selected?.kind === "shape"
                            ? selected.shape
                            : settings.shape) === s.id
                        }
                        onClick={() => {
                          setSettings({ shape: s.id });
                          if (selected?.kind === "shape")
                            patchItem({ shape: s.id });
                        }}
                      >
                        <s.icon size={19} />
                      </IconButton>
                    ))}
                  </div>
                  <h3>FILL</h3>
                  <div className="nb-fill-row">
                    <IconButton
                      label="No fill"
                      active={
                        (selected?.kind === "shape"
                          ? selected.fill
                          : settings.fill) === "transparent"
                      }
                      onClick={() => {
                        setSettings({ fill: "transparent" });
                        if (selected?.kind === "shape")
                          patchItem({ fill: "transparent" });
                      }}
                    >
                      <X size={17} />
                    </IconButton>
                    <Swatches
                      label="Shape fill"
                      colors={PASTELS.slice(0, 4)}
                      value={
                        selected?.kind === "shape"
                          ? selected.fill
                          : settings.fill
                      }
                      onChange={(fill) => {
                        setSettings({ fill });
                        if (selected?.kind === "shape") patchItem({ fill });
                      }}
                    />
                  </div>
                </div>
              )}
              {tool !== "pan" && (
                <div className="nb-panel-section">
                  <label className="nb-range-label" htmlFor="nb-opacity">
                    Opacity<span>{Math.round(opacity * 100)}%</span>
                  </label>
                  <input
                    id="nb-opacity"
                    type="range"
                    min="5"
                    max="100"
                    value={Math.round(opacity * 100)}
                    onChange={(e) => {
                      const opacity = +e.target.value / 100;
                      setSettings({ opacity });
                      if (selected) patchItem({ opacity });
                    }}
                  />
                </div>
              )}
              {selected && (
                <div className="nb-panel-section">
                  <h3>POSITION & SIZE</h3>
                  <div className="nb-position-grid">
                    {(
                      [
                        { key: "x", max: PAGE_WIDTH, label: "X" },
                        { key: "y", max: PAGE_HEIGHT, label: "Y" },
                        { key: "w", max: PAGE_WIDTH, label: "Width" },
                        { key: "h", max: PAGE_HEIGHT, label: "Height" },
                        { key: "rotation", max: 360, label: "Rotation" },
                      ] as const
                    ).map((p) => (
                      <label key={p.key}>
                        {p.label}
                        <input
                          type="number"
                          aria-label={`Item ${p.label.toLowerCase()}`}
                          min={
                            p.key === "rotation"
                              ? -360
                              : p.key === "w" || p.key === "h"
                                ? 1
                                : 0
                          }
                          max={p.max}
                          value={Math.round(selected[p.key])}
                          onChange={(e) =>
                            patchItem({
                              [p.key]: Math.max(
                                p.key === "rotation"
                                  ? -360
                                  : p.key === "w" || p.key === "h"
                                    ? 1
                                    : 0,
                                Math.min(p.max, +e.target.value || 0),
                              ),
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="nb-tool-tip">
                <Sparkles size={15} />
                <span>
                  Two fingers to pan & zoom.
                  <br />
                  Double-click text to make it yours.
                </span>
              </div>
            </>
          )}
        </div>
        <div className="nb-sidebar-footer">
          <button onClick={addSticky}>
            <StickyNote size={17} />
            <span>Add a sticky note</span>
            <span className="nb-plus">+</span>
          </button>
          <span>A little space for your imagination.</span>
        </div>
      </aside>
    </>
  );
}
