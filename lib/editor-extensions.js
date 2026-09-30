import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

const clampIndent = (value) =>
  Math.max(0, Math.min(8, Number.parseInt(value, 10) || 0));
export const ParagraphLayout = Extension.create({
  name: "paragraphLayout",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) =>
              clampIndent(element.getAttribute("data-indent")),
            renderHTML: ({ indent }) =>
              indent
                ? {
                    "data-indent": clampIndent(indent),
                    style: `margin-inline-start: ${clampIndent(indent) * 2}em`,
                  }
                : {},
          },
          writingDirection: {
            default: null,
            parseHTML: (element) =>
              ["ltr", "rtl"].includes(element.getAttribute("dir"))
                ? element.getAttribute("dir")
                : null,
            renderHTML: ({ writingDirection }) =>
              writingDirection ? { dir: writingDirection } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    const updateBlocks =
      (attributes) =>
      ({ state, tr, dispatch }) => {
        let found = false;
        state.doc.nodesBetween(
          state.selection.from,
          state.selection.to,
          (node, pos) => {
            if (!["paragraph", "heading"].includes(node.type.name)) return;
            found = true;
            if (dispatch)
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                ...attributes(node.attrs),
              });
          },
        );
        return found;
      };
    return {
      changeIndent: (delta) =>
        updateBlocks((attrs) => ({
          indent: clampIndent(attrs.indent + delta),
        })),
      setWritingDirection: (direction) =>
        updateBlocks(() => ({ writingDirection: direction })),
      clearParagraphLayout: () =>
        updateBlocks(() => ({
          indent: 0,
          writingDirection: null,
          textAlign: null,
        })),
    };
  },
});

export function createEditorExtensions(
  placeholder = "Start writing your post…",
) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      link: { openOnClick: false, defaultProtocol: "https" },
    }),
    Placeholder.configure({ placeholder }),
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyleKit,
    Image.configure({ allowBase64: false }),
    Youtube.configure({ nocookie: true, width: 640, height: 360 }),
    ParagraphLayout,
  ];
}
