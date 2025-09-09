'use client';
import styles from './tiptap-editor.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import FontSize from 'tiptap-extension-font-size';
import { CustomImage, YouTubeVideo } from '../extended';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useEffect } from 'react';
import { useContentStore } from '@/components/custom-ui/tiptap/plugin';
import { cn } from '@/lib/utils';
import { Toolbar } from './toolbar';
import { ScrollArea } from '../../scroll-area/scroll-area';
import { TableContextMenu } from '../menus/table-context-menu';
import { FontOptions } from '../plugin/tiptap-font-config/constants';

type Props = React.HTMLAttributes<HTMLElement> & {
  keyId: string;
  height?: number;
  onImageUpload?: (file: File) => Promise<string>;
  onChange?: (content: string) => void;
  content?: string;
};

export const TiptapEditor = ({
  className,
  keyId,
  height = 400,
  content: initialContent,
  onImageUpload,
  onChange,
}: Props) => {
  const { setContent } = useContentStore();

  const editor = useEditor({
    extensions: [
      Color,
      Highlight.configure({ multicolor: true }),
      StarterKit,
      Underline,
      FontFamily,
      TextStyle,
      FontSize,
      CustomImage,
      YouTubeVideo,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'right', 'center'],
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'font-bold hover:text-orange-600 hover:underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    immediatelyRender: false,
    // EditorContent 리렌더링 최적화
    shouldRerenderOnTransaction: false,
    onCreate: ({ editor }) => {
      // 에디터 생성 시 기본 폰트 크기와 폰트 설정
      editor.chain().selectAll().setFontSize('18px').setFontFamily(FontOptions['맑은 고딕']).run();
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setContent(keyId, content);
      onChange?.(content);
    },
  });

  useEffect(() => {
    if (!editor) return;
    // 초기값 설정 (최초 1회)
    if (initialContent) {
      editor.commands.setContent(initialContent!);
      setContent(keyId, initialContent!);
    }
  }, [editor, initialContent, keyId, setContent]);

  if (!editor) return null;

  return (
    <div className={`${cn('border rounded-xl relative', className)}`}>
      <Toolbar editor={editor} onImageUpload={onImageUpload} />
      <ScrollArea style={{ height: `${height}px` }}>
        <EditorContent
          editor={editor}
          className={cn(
            'p-6 border-none [&>.tiptap]:!outline-none',
            '[&_.resize-cursor]:cursor-col-resize',
            styles.tiptapGlobalStyles,
            className
          )}
          style={{ height: `${height}px` }}
        />
        <TableContextMenu editor={editor} />
      </ScrollArea>
    </div>
  );
};
