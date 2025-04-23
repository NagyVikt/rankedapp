"use client"; // ← MUST be first line

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import styled from 'styled-components';



import EmailEditor, {
    Editor,
    EditorRef,
    EmailEditorProps,
    UnlayerOptions,
  } from '@/components/email';

import sample from './sample.json';

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  font-family: sans-serif;
`;
const Bar = styled.div`
  flex-shrink: 0;
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;

  h1 {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  a {
    margin-left: auto;
    margin-right: 15px;
    color: #007bff;
    text-decoration: none;
  }
  button {
    flex-shrink: 0;
    padding: 8px 15px;
    margin-left: 10px;
    font-size: 14px;
    font-weight: 500;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover:not(:disabled) {
      background-color: #0056b3;
    }
    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
`;
const EditorContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
`;

interface UnlayerDesign {
  counters: object;
  body: object;
  schemaVersion: number;
  [key: string]: any;
}
interface UnlayerExportData {
  design: UnlayerDesign;
  html: string;
}

const ExamplePage: React.FC = () => {
  const emailEditorRef = useRef<EditorRef | null>(null);
  const [preview, setPreview] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const getEditor = () => emailEditorRef.current?.editor;

  const saveDesign = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.saveDesign((d: UnlayerDesign) => {
      console.log('Design JSON:', JSON.stringify(d, null, 2));
      alert('Design JSON logged to console.');
    });
  }, []);

  const exportHtml = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    editor.exportHtml((data: UnlayerExportData) => {
      console.log('HTML:', data.html);
      console.log('Design:', JSON.stringify(data.design, null, 2));
      alert('HTML and JSON logged to console.');
    });
  }, []);

  const togglePreview = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    if (preview) {
      editor.hidePreview();
      setPreview(false);
    } else {
      editor.showPreview('desktop');
      setPreview(true);
    }
  }, [preview]);

  const onDesignLoad = useCallback((d: any) => {
    console.log('Design loaded', d);
  }, []);

  const onLoad = useCallback((unlayer: UnlayerEditor) => {
    console.log('Editor loaded');
    setIsReady(false);
    unlayer.addEventListener('design:loaded', onDesignLoad);
    if (sample && Object.keys(sample).length) {
      unlayer.loadDesign(sample as UnlayerDesign);
    }
  }, [onDesignLoad]);

  const onReady = useCallback((unlayer: UnlayerEditor) => {
    console.log('Editor ready');
    setIsReady(true);
  }, []);

  return (
    <Container>
      <Bar>
        <h1>React Email Editor (Demo)</h1>
        <a
          href="https://github.com/unlayer/react-email-editor"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <button onClick={togglePreview} disabled={!isReady}>
          {preview ? 'Hide' : 'Show'} Preview
        </button>
        <button onClick={saveDesign} disabled={!isReady}>
          Save Design
        </button>
        <button onClick={exportHtml} disabled={!isReady}>
          Export HTML
        </button>
      </Bar>
      <EditorContainer>
        <EmailEditor
          ref={emailEditorRef}
          onLoad={onLoad}
          onReady={onReady}
          options={{
            projectId: 1234,
            appearance: { theme: 'modern_light' },
            displayMode: 'email',
          }}
        />
      </EditorContainer>
    </Container>
  );
};

export default ExamplePage;
