"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function MyEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style:
          "min-height:120px; border:1px solid #333; border-radius:4px; padding:8px; background:#23272f; color:#fff;",
        class: "focus:outline-none",
      },
    },
    // This disables SSR rendering for the editor
    immediatelyRender: false,
  });

  if (!editor) return null; // Prevent SSR hydration mismatch

  return <EditorContent editor={editor} />;
}
