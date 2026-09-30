"use client";
import { useEffect, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { createEditorExtensions } from "@/lib/editor-extensions";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  RemoveFormatting,
  ImagePlus,
  Clapperboard,
  Smile,
  Globe,
  IndentIncrease,
  IndentDecrease,
  PilcrowLeft,
  PilcrowRight,
  Type,
  CaseSensitive,
  ChevronDown,
  X,
} from "lucide-react";

const EMOJI = [
  ["😀", "Grinning face"],
  ["😊", "Smiling face"],
  ["❤️", "Heart"],
  ["👍", "Thumbs up"],
  ["🎉", "Celebration"],
  ["✨", "Sparkles"],
  ["💡", "Idea"],
  ["📌", "Pin"],
  ["✅", "Check mark"],
  ["🌍", "Globe"],
  ["🔥", "Fire"],
  ["👏", "Applause"],
];
const SYMBOLS = [
  ["©", "Copyright"],
  ["®", "Registered"],
  ["™", "Trademark"],
  ["€", "Euro"],
  ["£", "Pound"],
  ["₵", "Cedi"],
  ["—", "Em dash"],
  ["…", "Ellipsis"],
  ["→", "Right arrow"],
  ["•", "Bullet"],
  ["½", "One half"],
  ["°", "Degree"],
];
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  id = "content",
}) {
  const [panel, setPanel] = useState(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: createEditorExtensions(placeholder),
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id,
        class: "rte-body",
        role: "textbox",
        "aria-label": "Article content",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });
  useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            selection: editor.state.selection,
            doc: editor.state.doc,
            marks: editor.state.storedMarks,
          }
        : null,
  });
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value))
      editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);
  const words =
    editor?.getText().trim().split(/\s+/).filter(Boolean).length || 0;
  const textStyle = editor?.getAttributes("textStyle") || {};
  const block = editor?.isActive("heading") ? "heading" : "paragraph";
  const direction = editor?.getAttributes(block).writingDirection;
  function closePanel() {
    setPanel(null);
    setError("");
    editor?.commands.focus();
  }
  function openPanel(name) {
    if (panel === name) {
      closePanel();
      return;
    }
    setPanel(name);
    setError("");
    setAlt("");
    setUrl(name === "link" ? editor.getAttributes("link").href || "" : "");
  }
  function tool(label, Icon, command, active = false, disabled = false, popup) {
    return (
      <button
        key={label}
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={popup ? undefined : active}
        aria-expanded={popup ? panel === popup : undefined}
        aria-controls={popup ? `${id}-tools` : undefined}
        className={`rte-btn ${active ? "is-active" : ""}`}
        disabled={!editor || disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={command}
      >
        <Icon size={16} />
      </button>
    );
  }
  function insertMedia() {
    const source = url.trim();
    if (panel === "link" && !source) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closePanel();
      return;
    }
    try {
      const parsed = new URL(source);
      const protocols =
        panel === "link" ? ["https:", "http:", "mailto:"] : ["https:", "http:"];
      if (!protocols.includes(parsed.protocol)) throw new Error();
      if (
        panel === "video" &&
        ![
          "youtube.com",
          "www.youtube.com",
          "m.youtube.com",
          "youtu.be",
          "www.youtube-nocookie.com",
        ].includes(parsed.hostname)
      )
        throw new Error();
    } catch {
      setError(
        panel === "video"
          ? "Enter a valid YouTube video URL."
          : "Enter a valid URL beginning with https:// or http://.",
      );
      return;
    }
    if (panel === "link")
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: source })
        .run();
    if (panel === "image")
      editor.chain().focus().setImage({ src: source, alt: alt.trim() }).run();
    if (
      panel === "video" &&
      !editor.chain().focus().setYoutubeVideo({ src: source }).run()
    ) {
      setError("That YouTube URL could not be embedded.");
      return;
    }
    closePanel();
  }
  function indent(delta) {
    if (editor.isActive("listItem"))
      editor
        .chain()
        .focus()
        [delta > 0 ? "sinkListItem" : "liftListItem"]("listItem")
        .run();
    else editor.chain().focus().changeIndent(delta).run();
  }
  const menu = (label, Icon, options, selected, onChange, wide = false) => (
    <label
      className={`rte-select-control ${wide ? "rte-select-wide" : ""}`}
      title={label}
    >
      {Icon && <Icon size={16} />}
      <select
        aria-label={label}
        disabled={!editor}
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([value, name]) => (
          <option key={value} value={value}>
            {name}
          </option>
        ))}
      </select>
      {!wide && <ChevronDown size={10} />}
    </label>
  );
  return (
    <div className="rte rte-classic">
      <div className="rte-toolbar" role="group" aria-label="Text formatting">
        {menu(
          "Font family",
          Type,
          [
            ["", "Default"],
            ["Arial", "Arial"],
            ["Georgia", "Georgia"],
            ["Times New Roman", "Times New Roman"],
            ["Verdana", "Verdana"],
            ["Courier New", "Courier New"],
          ],
          textStyle.fontFamily || "",
          (font) =>
            font
              ? editor.chain().focus().setFontFamily(font).run()
              : editor.chain().focus().unsetFontFamily().run(),
        )}
        {menu(
          "Font size",
          CaseSensitive,
          [
            ["", "Default"],
            ...[12, 14, 16, 18, 20, 24, 28, 32, 40, 48].map((n) => [
              `${n}px`,
              `${n}px`,
            ]),
          ],
          textStyle.fontSize || "",
          (size) =>
            size
              ? editor.chain().focus().setFontSize(size).run()
              : editor.chain().focus().unsetFontSize().run(),
        )}
        {menu(
          "Text style",
          null,
          [
            ["p", "Normal"],
            ["1", "Heading 1"],
            ["2", "Heading 2"],
            ["3", "Heading 3"],
            ["4", "Heading 4"],
          ],
          editor?.isActive("heading")
            ? String(editor.getAttributes("heading").level)
            : "p",
          (style) =>
            style === "p"
              ? editor.chain().focus().setParagraph().run()
              : editor
                  .chain()
                  .focus()
                  .setHeading({ level: Number(style) })
                  .run(),
          true,
        )}
        <span className="toolbar-divider" />
        {[
          ["Bold", Bold, "bold", "toggleBold"],
          ["Italic", Italic, "italic", "toggleItalic"],
          ["Underline", Underline, "underline", "toggleUnderline"],
          ["Strikethrough", Strikethrough, "strike", "toggleStrike"],
        ].map(([label, Icon, mark, command]) =>
          tool(
            label,
            Icon,
            () => editor.chain().focus()[command]().run(),
            editor?.isActive(mark),
          ),
        )}
        {tool(
          "Text color",
          Type,
          () => openPanel("color"),
          panel === "color",
          false,
          "color",
        )}
        {tool(
          "Highlight color",
          Highlighter,
          () => openPanel("highlight"),
          editor?.isActive("highlight"),
          false,
          "highlight",
        )}
        <span className="toolbar-divider" />
        {tool(
          "Insert link",
          Link2,
          () => openPanel("link"),
          editor?.isActive("link"),
          false,
          "link",
        )}
        {tool(
          "Insert image",
          ImagePlus,
          () => openPanel("image"),
          panel === "image",
          false,
          "image",
        )}
        {tool(
          "Insert YouTube video",
          Clapperboard,
          () => openPanel("video"),
          panel === "video",
          false,
          "video",
        )}
        {tool(
          "Insert emoji",
          Smile,
          () => openPanel("emoji"),
          panel === "emoji",
          false,
          "emoji",
        )}
        <span className="toolbar-divider" />
        {menu(
          "Text alignment",
          editor?.isActive({ textAlign: "center" })
            ? AlignCenter
            : editor?.isActive({ textAlign: "right" })
              ? AlignRight
              : editor?.isActive({ textAlign: "justify" })
                ? AlignJustify
                : AlignLeft,
          [
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"],
            ["justify", "Justify"],
          ],
          editor?.getAttributes(block).textAlign || "left",
          (align) => editor.chain().focus().setTextAlign(align).run(),
        )}
        {tool("Increase indent", IndentIncrease, () => indent(1))}
        {tool("Decrease indent", IndentDecrease, () => indent(-1))}
        <span className="toolbar-divider" />
        {tool(
          "Bullet list",
          List,
          () => editor.chain().focus().toggleBulletList().run(),
          editor?.isActive("bulletList"),
        )}
        {tool(
          "Numbered list",
          ListOrdered,
          () => editor.chain().focus().toggleOrderedList().run(),
          editor?.isActive("orderedList"),
        )}
        {tool(
          "Quote",
          Quote,
          () => editor.chain().focus().toggleBlockquote().run(),
          editor?.isActive("blockquote"),
        )}
        {tool("Horizontal rule", Minus, () =>
          editor.chain().focus().setHorizontalRule().run(),
        )}
        <span className="toolbar-divider" />
        {tool(
          "Left-to-right text",
          PilcrowRight,
          () => editor.chain().focus().setWritingDirection("ltr").run(),
          direction === "ltr",
        )}
        {tool(
          "Right-to-left text",
          PilcrowLeft,
          () => editor.chain().focus().setWritingDirection("rtl").run(),
          direction === "rtl",
        )}
        {tool(
          "Insert special character",
          Globe,
          () => openPanel("symbols"),
          panel === "symbols",
          false,
          "symbols",
        )}
        <span className="toolbar-divider" />
        {tool("Clear formatting", RemoveFormatting, () =>
          editor
            .chain()
            .focus()
            .clearNodes()
            .unsetAllMarks()
            .clearParagraphLayout()
            .run(),
        )}
        {tool(
          "Code block",
          Code,
          () => editor.chain().focus().toggleCodeBlock().run(),
          editor?.isActive("codeBlock"),
        )}
        {tool(
          "Undo",
          Undo2,
          () => editor.chain().focus().undo().run(),
          false,
          !editor?.can().undo(),
        )}
        {tool(
          "Redo",
          Redo2,
          () => editor.chain().focus().redo().run(),
          false,
          !editor?.can().redo(),
        )}
      </div>
      {panel && (
        <div
          id={`${id}-tools`}
          className="rte-tools-panel"
          role="group"
          aria-label={`${panel} options`}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              closePanel();
            }
          }}
        >
          <button
            type="button"
            className="rte-panel-close rte-btn"
            aria-label="Close formatting options"
            onClick={closePanel}
          >
            <X size={16} />
          </button>
          {["link", "image", "video"].includes(panel) && (
            <div className="rte-media-fields">
              <label htmlFor={`${id}-url`}>
                {panel === "link"
                  ? "Link URL"
                  : panel === "image"
                    ? "Image URL"
                    : "YouTube video URL"}
              </label>
              <input
                id={`${id}-url`}
                className="input"
                type="url"
                placeholder={
                  panel === "video"
                    ? "https://www.youtube.com/watch?v=…"
                    : "https://…"
                }
                value={url}
                autoFocus
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    insertMedia();
                  }
                }}
              />
              {panel === "image" && (
                <>
                  <label htmlFor={`${id}-alt`}>
                    Image description (alt text)
                  </label>
                  <input
                    className="input"
                    id={`${id}-alt`}
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Describe the image"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        insertMedia();
                      }
                    }}
                  />
                </>
              )}
              <div className="rte-panel-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={insertMedia}
                >
                  {panel === "link" ? "Apply link" : "Insert"}
                </button>
                {panel === "link" && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .unsetLink()
                        .run();
                      closePanel();
                    }}
                  >
                    <Unlink size={14} />
                    Remove link
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closePanel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {["color", "highlight"].includes(panel) && (
            <div className="rte-color-options">
              <strong>
                {panel === "color" ? "Text color" : "Highlight color"}
              </strong>
              <div className="rte-swatches">
                {[
                  ["#24262b", "Charcoal"],
                  ["#64748b", "Slate"],
                  ["#b91c1c", "Red"],
                  ["#c2410c", "Orange"],
                  ["#166534", "Green"],
                  ["#1d4ed8", "Blue"],
                  ["#7e22ce", "Purple"],
                  ["#be185d", "Pink"],
                  ["#fef08a", "Yellow"],
                  ["#bbf7d0", "Light green"],
                  ["#bfdbfe", "Light blue"],
                  ["#ffffff", "White"],
                ].map(([color, name]) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`${name} ${panel === "color" ? "text" : "highlight"}`}
                    title={name}
                    style={{ background: color }}
                    onClick={() => {
                      const chain = editor.chain().focus();
                      if (panel === "color") chain.setColor(color).run();
                      else chain.setHighlight({ color }).run();
                      closePanel();
                    }}
                  />
                ))}
              </div>
              <label className="rte-custom-color">
                Custom color
                <input
                  type="color"
                  aria-label="Custom color"
                  defaultValue={panel === "color" ? "#24262b" : "#fef08a"}
                  onChange={(e) =>
                    panel === "color"
                      ? editor.chain().setColor(e.target.value).run()
                      : editor
                          .chain()
                          .setHighlight({ color: e.target.value })
                          .run()
                  }
                />
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (panel === "color")
                    editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().unsetHighlight().run();
                  closePanel();
                }}
              >
                Reset color
              </button>
            </div>
          )}
          {["emoji", "symbols"].includes(panel) && (
            <>
              <p className="rte-panel-title">
                {panel === "emoji" ? "Emoji" : "Special characters"}
              </p>
              <div className="rte-character-grid">
                {(panel === "emoji" ? EMOJI : SYMBOLS).map(([symbol, name]) => (
                  <button
                    type="button"
                    key={name}
                    title={name}
                    aria-label={`Insert ${name}`}
                    onClick={() => {
                      editor.chain().focus().insertContent(symbol).run();
                      closePanel();
                    }}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </>
          )}
          {error && (
            <p className="rte-panel-error" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
      <EditorContent editor={editor} />
      {!editor && (
        <div className="rte-loading">Preparing your writing space…</div>
      )}
      <div className="rte-footer">
        <span>Rich text editor</span>
        <span>
          {words} {words === 1 ? "word" : "words"} ·{" "}
          {words ? Math.ceil(words / 200) : 0} min read
        </span>
      </div>
    </div>
  );
}
