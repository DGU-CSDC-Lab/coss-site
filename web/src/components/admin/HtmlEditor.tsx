'use client'

import { useEffect, useRef } from 'react'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export default function HtmlEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
}: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      editorRef.current &&
      !isInitialized.current
    ) {
      initializeEditor()
      isInitialized.current = true
    }
  }, [])

  useEffect(() => {
    // value가 변경될 때 에디터 내용 업데이트
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || `<p>${placeholder}</p>`
    }
  }, [value, placeholder])

  const initializeEditor = () => {
    const editor = editorRef.current
    if (!editor) return

    // 기본 스타일 설정
    editor.style.minHeight = `${height}px`
    editor.style.border = '1px solid #e5e7eb'
    editor.style.borderRadius = '6px'
    editor.style.padding = '12px'
    editor.style.fontSize = '16px'
    editor.style.lineHeight = '1.5'
    editor.style.outline = 'none'
    editor.style.backgroundColor = 'white'

    // 초기 내용 설정
    editor.innerHTML = value || `<p>${placeholder}</p>`

    // 이벤트 리스너
    editor.addEventListener('input', handleInput)
    editor.addEventListener('focus', handleFocus)
    editor.addEventListener('blur', handleBlur)
    editor.addEventListener('paste', handlePaste)
  }

  const handleInput = () => {
    const editor = editorRef.current
    if (!editor) return

    const content = editor.innerHTML
    onChange(content)
  }

  const handleFocus = () => {
    const editor = editorRef.current
    if (!editor) return

    if (editor.innerHTML === `<p>${placeholder}</p>`) {
      editor.innerHTML = '<p><br></p>'
      // 커서를 p 태그 안으로 이동
      const range = document.createRange()
      const sel = window.getSelection()
      range.setStart(editor.firstChild!, 0)
      range.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }

  const handleBlur = () => {
    const editor = editorRef.current
    if (!editor) return

    if (
      editor.innerHTML === '<p><br></p>' ||
      editor.innerHTML === '' ||
      editor.textContent?.trim() === ''
    ) {
      editor.innerHTML = `<p>${placeholder}</p>`
    }
  }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') || ''

    // 선택된 텍스트를 일반 텍스트로 교체
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    handleInput()
  }

  const execCommand = (command: string, value?: string) => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()

    try {
      // insertHTML을 사용한 직접 삽입 방식
      if (command === 'formatBlock') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString() || '텍스트를 입력하세요'
          let html = ''

          switch (value) {
            case 'h1':
              html = `<h1>${selectedText}</h1>`
              break
            case 'h2':
              html = `<h2>${selectedText}</h2>`
              break
            case 'p':
              html = `<p>${selectedText}</p>`
              break
            default:
              html = `<${value}>${selectedText}</${value}>`
          }

          document.execCommand('insertHTML', false, html)
        }
      } else if (command === 'insertUnorderedList') {
        const selection = window.getSelection()
        const selectedText = selection?.toString() || '목록 항목'
        document.execCommand(
          'insertHTML',
          false,
          `<ul><li>${selectedText}</li></ul>`
        )
      } else if (command === 'insertOrderedList') {
        const selection = window.getSelection()
        const selectedText = selection?.toString() || '목록 항목'
        document.execCommand(
          'insertHTML',
          false,
          `<ol><li>${selectedText}</li></ol>`
        )
      } else if (command === 'createLink') {
        const url = prompt('링크 URL을 입력하세요:')
        if (url) {
          const selection = window.getSelection()
          const selectedText = selection?.toString() || '링크 텍스트'
          document.execCommand(
            'insertHTML',
            false,
            `<a href="${url}" target="_blank">${selectedText}</a>`
          )
        }
        return
      } else if (command === 'insertImage') {
        const url = prompt('이미지 URL을 입력하세요:')
        if (url) {
          document.execCommand(
            'insertHTML',
            false,
            `<img src="${url}" alt="이미지" style="max-width: 100%; height: auto;">`
          )
        }
        return
      } else {
        // 기본 명령들 (bold, italic, underline 등)
        document.execCommand(command, false, value)
      }

      handleInput()
    } catch (error) {
      console.error('Command execution failed:', error)
    }
  }

  return (
    <div className="border border-surface rounded-md overflow-hidden">
      {/* 툴바 */}
      <div className="bg-surface border-b border-surface p-2 flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14 font-bold"
          title="굵게"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14 italic"
          title="기울임"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14 underline"
          title="밑줄"
        >
          U
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h1')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="제목 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h2')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="제목 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'p')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="본문"
        >
          P
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="불릿 목록"
        >
          • 목록
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="번호 목록"
        >
          1. 목록
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('createLink')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="링크"
        >
          🔗
        </button>

        <button
          type="button"
          onClick={() => execCommand('insertImage')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="이미지"
        >
          🖼️
        </button>

        <div className="w-px bg-gray-300 mx-1"></div>

        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1 hover:bg-gray-200 rounded font-caption-14"
          title="서식 제거"
        >
          ✂️
        </button>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="focus:outline-none"
        style={{ minHeight: height }}
      />
    </div>
  )
}
