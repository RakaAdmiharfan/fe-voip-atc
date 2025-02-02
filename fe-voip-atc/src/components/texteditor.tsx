"use client";

import { useState, useEffect, useCallback } from "react";
import { Content, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuButtonRedo,
  MenuButtonUndo,
  MenuButtonBulletedList,
  MenuButtonOrderedList,
  MenuButtonAlignLeft,
  MenuButtonAlignCenter,
  MenuButtonAlignRight,
  MenuButtonAlignJustify,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
  MenuButton,
  useRichTextEditorContext,
} from "mui-tiptap";
import { Box, SxProps, Typography } from "@mui/material";
import {
  FormatIndentDecrease,
  FormatIndentIncrease,
  InsertLink,
  LinkOff,
} from "@mui/icons-material";

// Extend the Editor type to include our custom commands
type EditorWithIndent = Editor & {
  commands: Editor["commands"] & {
    indent: () => boolean;
    outdent: () => boolean;
    setLink: (attributes: { href: string; target?: string }) => boolean;
    unsetLink: () => boolean;
  };
};

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const MenuButtonLink = () => {
  const editor = useRichTextEditorContext() as EditorWithIndent;

  const handleSetLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: urlWithProtocol,
        target: "_blank",
      })
      .run();
  }, [editor]);

  return (
    <MenuButton
      onClick={handleSetLink}
      tooltipLabel="Insert Link"
      tooltipShortcutKeys={[`${isMac ? "⌘" : "Ctrl"}`, "K"]}
      IconComponent={InsertLink}
      disabled={!editor?.isEditable}
      selected={editor?.isActive("link")}
    />
  );
};

const MenuUnsetButtonLink = () => {
  const editor = useRichTextEditorContext() as EditorWithIndent;

  const handleUnsetLink = () => {
    if (editor?.isActive("link")) {
      editor.chain().focus().unsetLink().run();
    }
  };

  return (
    <MenuButton
      onClick={handleUnsetLink}
      tooltipLabel={`Remove Link`}
      tooltipShortcutKeys={[`${isMac ? "⌘" : "Ctrl"}`, "Shift", "K"]}
      IconComponent={LinkOff}
      disabled={!editor?.isEditable || !editor.isActive("link")}
    />
  );
};

const MenuButtonIndent = () => {
  const editor = useRichTextEditorContext() as EditorWithIndent;
  return (
    <MenuButton
      onClick={() => editor?.commands.indent()}
      tooltipLabel={`Indent`}
      tooltipShortcutKeys={["Tab"]}
      IconComponent={FormatIndentIncrease}
      disabled={!editor?.isEditable}
    />
  );
};

const MenuButtonOutdent = () => {
  const editor = useRichTextEditorContext() as EditorWithIndent;
  return (
    <MenuButton
      onClick={() => editor?.commands.outdent()}
      tooltipLabel={`Outdent`}
      tooltipShortcutKeys={["Shift", "Tab"]}
      IconComponent={FormatIndentDecrease}
      disabled={!editor?.isEditable}
    />
  );
};

export function CustomTextEditor({
  initialValue = "",
  onChange,
  error = false,
  helperText,
  label,
  sx,
}: {
  initialValue: Content | undefined;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  sx?: SxProps;
}) {
  const [content, setContent] = useState(initialValue);
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false, // Prevents automatic opening when clicking links in editor
        autolink: true,
        defaultProtocol: "https",
        validate: (href) => /^https?:\/\//.test(href), // Ensure links have http/https protocol
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      try {
        if (editor) {
          const html = editor.getHTML();
          setContent(html);
          if (onChange) {
            onChange(html);
          }
        }
      } catch (error) {
        console.error("Error during editor update:", error);
      }
    },
    editorProps: {
      handleKeyDown: (_, event) => {
        if (event.metaKey || event.ctrlKey) {
          if (event.key === "k" && !event.shiftKey) {
            event.preventDefault();
            const previousUrl = editor?.getAttributes("link").href;
            const url = window.prompt("URL", previousUrl);

            if (url === null) return; // cancelled

            if (url === "") {
              editor?.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }

            const urlWithProtocol = url.match(/^https?:\/\//)
              ? url
              : `https://${url}`;
            editor
              ?.chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: urlWithProtocol, target: "_blank" })
              .run();
          }
          if (event.key === "K" && event.shiftKey) {
            event.preventDefault();
            if (editor?.isActive("link")) {
              editor?.chain().focus().unsetLink().run();
            }
          }
        }
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <Box sx={sx}>
      {label && (
        <p
          className={`text-[#414651] font-medium text-[14px] mb-2 ${
            label == "Data Keluarga Inti" ? "" : "mt-4"
          }`}
        >
          {label}
        </p>
      )}
      <RichTextEditorProvider editor={editor}>
        <RichTextField
          controls={
            <MenuControlsContainer>
              <MenuButtonUndo />
              <MenuButtonRedo />
              <MenuSelectHeading />
              <MenuDivider />
              <MenuButtonBold />
              <MenuButtonItalic />
              <MenuDivider />
              <MenuButtonLink />
              <MenuUnsetButtonLink />
              <MenuDivider />
              <MenuButtonAlignLeft />
              <MenuButtonAlignCenter />
              <MenuButtonAlignRight />
              <MenuButtonAlignJustify />
              <MenuDivider />
              <MenuButtonIndent />
              <MenuButtonOutdent />
              <MenuDivider />
              <MenuButtonBulletedList />
              <MenuButtonOrderedList />
              <MenuDivider />
            </MenuControlsContainer>
          }
        />
      </RichTextEditorProvider>
      {error && helperText && (
        <Typography sx={{ fontSize: 12, color: "#FF6D6D", mt: "3px" }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
