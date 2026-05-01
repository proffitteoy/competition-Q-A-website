"use client";

import { useEffect, useRef } from "react";
import { Link2, List, ListOrdered, Bold, Italic, Underline } from "lucide-react";

import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function normalizeHtml(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "请输入内容",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalized = normalizeHtml(value);
    if (editor.innerHTML !== normalized) {
      editor.innerHTML = normalized;
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, commandValue);
    onChange(editor.innerHTML);
  };

  return (
    <div className="rounded-lg border border-border/60">
      <div className="flex flex-wrap gap-2 border-b border-border/60 p-2">
        <Button type="button" size="sm" variant="outline" onClick={() => runCommand("bold")}>
          <Bold className="size-4" />
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => runCommand("italic")}>
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => runCommand("underline")}
        >
          <Underline className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => runCommand("insertUnorderedList")}
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => runCommand("insertOrderedList")}
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            const href = window.prompt("请输入链接地址（https://...）");
            if (!href) return;
            runCommand("createLink", href);
          }}
        >
          <Link2 className="size-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => {
          onChange((event.currentTarget as HTMLDivElement).innerHTML);
        }}
        data-placeholder={placeholder}
        className="min-h-44 p-3 text-sm leading-7 outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
