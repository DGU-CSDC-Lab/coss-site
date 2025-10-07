'use client'

import { useEffect, useRef, useState } from 'react'
import {
  LinkIcon,
  PhotoIcon,
  ScissorsIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline'
import { uploadImageFile, insertImageToEditor } from '@/utils/imageUpload'
import { useAlert } from '@/hooks/useAlert'

interface HtmlEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number | string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  showToolbar?: boolean
  onGetImageFileKeys?: (getFileKeys: () => string[]) => void
}

export default function HtmlEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
  onScroll,
  showToolbar = true,
  onGetImageFileKeys,
}: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitialized = useRef(false)
  const alert = useAlert()
  const [currentFormat, setCurrentFormat] = useState<string>('p')
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  })
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkData, setLinkData] = useState({ name: '', url: '' })

  const [savedRange, setSavedRange] = useState<Range | null>(null)

  // 이미지 업로드 (임시)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const imageResult = await uploadImageFile(file)
      
      // 에디터에 포커스를 주고 잠시 기다린 후 이미지 삽입
      if (editorRef.current) {
        editorRef.current.focus()
        
        setTimeout(() => {
          // 저장된 커서 위치가 있으면 복원
          if (savedRange) {
            const selection = window.getSelection()
            selection?.removeAllRanges()
            selection?.addRange(savedRange)
          }
          
          insertImageToEditor(editorRef, imageResult)
          handleInput() // 변경사항 반영
          setSavedRange(null)
        }, 50)
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      alert.error(
        `이미지 업로드 중 오류가 발생했습니다. \n${(error as Error).message}`
      )
    }
  }

  // 파일 선택 버튼 클릭 시 현재 커서 위치 저장
  const handleImageButtonClick = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0).cloneRange())
    }
    // 파일 입력 클릭
    fileInputRef.current?.click()
  }

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer?.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        handleImageFile(file)
        break // 첫 번째 이미지만 처리
      }
    }
  }

  // 클립보드 이미지 붙여넣기 처리
  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          handleImageFile(file)
        }
        return
      }
    }

    // 일반 텍스트/HTML 붙여넣기는 기본 동작 허용
    setTimeout(() => {
      handleInput()
      updateCurrentFormat()
    }, 10)
  }

  // 에디터 내 이미지의 fileKey 추출
  const getImageFileKeys = (): string[] => {
    if (!editorRef.current) return []

    const images = editorRef.current.querySelectorAll('img[data-file-key]')
    return Array.from(images)
      .map(img => img.getAttribute('data-file-key'))
      .filter(Boolean) as string[]
  }

  // 외부에서 fileKey를 가져올 수 있도록 콜백 제공
  useEffect(() => {
    if (onGetImageFileKeys) {
      onGetImageFileKeys(getImageFileKeys)
    }
  }, [onGetImageFileKeys])

  // 이미지 파일 처리 (업로드 + 삽입)
  const handleImageFile = async (file: File) => {
    try {
      const imageResult = await uploadImageFile(file)
      insertImageToEditor(editorRef, imageResult)
      handleInput() // 변경사항 반영
    } catch (error) {
      console.error('Image upload failed:', error)
      alert.error(
        `이미지 업로드 중 오류가 발생했습니다. \n${(error as Error).message}`
      )
    }
  }

  // 색상 변경
  const handleColorChange = (color: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = selection.toString()

      if (selectedText) {
        const span = document.createElement('span')
        span.style.color = color

        try {
          span.appendChild(range.extractContents())
          range.insertNode(span)
          range.selectNodeContents(span)
          selection.removeAllRanges()
          selection.addRange(range)
        } catch (error) {
          document.execCommand(
            'insertHTML',
            false,
            `<span style="color: ${color}">${selectedText}</span>`
          )
        }
        handleInput()
      }
    }
  }

  // 배경색 변경
  const handleBackgroundColorChange = (color: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = selection.toString()

      if (selectedText) {
        const span = document.createElement('span')
        span.style.backgroundColor = color

        try {
          span.appendChild(range.extractContents())
          range.insertNode(span)
          range.selectNodeContents(span)
          selection.removeAllRanges()
          selection.addRange(range)
        } catch (error) {
          document.execCommand(
            'insertHTML',
            false,
            `<span style="background-color: ${color}">${selectedText}</span>`
          )
        }
        handleInput()
      }
    }
  }

  // 링크 버튼 클릭 시 현재 커서 위치 저장
  const handleLinkButtonClick = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0).cloneRange())
    }
    setShowLinkModal(true)
  }

  // 링크 추가
  const handleAddLink = () => {
    if (linkData.name && linkData.url) {
      // 에디터에 포커스를 주고 저장된 커서 위치 복원
      if (editorRef.current) {
        editorRef.current.focus()
        
        if (savedRange) {
          const selection = window.getSelection()
          selection?.removeAllRanges()
          selection?.addRange(savedRange)
        }
        
        document.execCommand(
          'insertHTML',
          false,
          `<a to="${linkData.url}" target="_blank">${linkData.name}</a>`
        )
      }
      
      setLinkData({ name: '', url: '' })
      setShowLinkModal(false)
      setSavedRange(null)
      handleInput()
    }
  }

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

  const checkFormatState = (tagName: string): boolean => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      console.log(`checkFormatState(${tagName}): No selection`)
      return false
    }

    const range = selection.getRangeAt(0)
    let element = range.commonAncestorContainer

    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentNode!
    }

    console.log(`checkFormatState(${tagName}): Starting from element:`, element)

    // 상위 요소들을 검사하여 해당 태그가 있는지 확인
    while (element && element !== editorRef.current) {
      const currentTagName = (element as Element).tagName?.toLowerCase()
      console.log(
        `checkFormatState(${tagName}): Checking element:`,
        currentTagName
      )

      if (currentTagName === tagName.toLowerCase()) {
        console.log(`checkFormatState(${tagName}): Found match!`)
        return true
      }
      element = element.parentNode!
    }

    console.log(`checkFormatState(${tagName}): No match found`)
    return false
  }

  const updateCurrentFormat = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    let element = range.commonAncestorContainer

    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentNode!
    }

    // 블록 요소 찾기
    let blockElement = element
    while (blockElement && blockElement !== editorRef.current) {
      const tagName = (blockElement as Element).tagName?.toLowerCase()
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        setCurrentFormat(tagName)
        break
      }
      blockElement = blockElement.parentNode!
    }
    if (blockElement === editorRef.current) {
      setCurrentFormat('p')
    }

    // 인라인 포맷 상태 확인
    const formatStates = {
      bold: checkFormatState('b') || checkFormatState('strong'),
      italic: checkFormatState('i') || checkFormatState('em'),
      underline: checkFormatState('u'),
      insertUnorderedList: checkFormatState('ul'),
      insertOrderedList: checkFormatState('ol'),
    }

    console.log('Format states updated:', formatStates)
    setActiveFormats(formatStates)
  }

  const initializeEditor = () => {
    const editor = editorRef.current
    if (!editor) return

    // 초기 내용 설정
    editor.innerHTML = value || `<p">${placeholder}</p>`

    // 이벤트 리스너
    editor.addEventListener('input', handleInput)
    editor.addEventListener('focus', handleFocus)
    editor.addEventListener('blur', handleBlur)
    editor.addEventListener('paste', handlePasteEvent)
    editor.addEventListener('keyup', updateCurrentFormat)
    editor.addEventListener('mouseup', updateCurrentFormat)
    editor.addEventListener('dragover', handleDragOver)
    editor.addEventListener('drop', handleDrop)
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

    const hasImages = editor.querySelectorAll('img').length > 0
    const hasText = editor.textContent?.trim() !== ''

    if (
      !hasImages &&
      !hasText &&
      (editor.innerHTML === '<p><br></p>' || editor.innerHTML === '')
    ) {
      editor.innerHTML = `<p>${placeholder}</p>`
    }
  }

  const handlePasteEvent = (e: ClipboardEvent) => {
    handlePaste(e)
  }

  const execCommand = (command: string, value?: string) => {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()

    try {
      // formatBlock 명령어 처리 (H1, H2, P 등)
      if (command === 'formatBlock') {
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)

          // 현재 커서가 있는 블록 요소 찾기
          let blockElement = range.commonAncestorContainer
          if (blockElement.nodeType === Node.TEXT_NODE) {
            blockElement = blockElement.parentNode!
          }

          // 가장 가까운 블록 요소 찾기
          while (blockElement && blockElement !== editor) {
            const tagName = (blockElement as Element).tagName?.toLowerCase()
            if (
              ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(tagName)
            ) {
              break
            }
            blockElement = blockElement.parentNode!
          }

          if (blockElement && blockElement !== editor) {
            const element = blockElement as HTMLElement
            const content = element.innerHTML

            // 새로운 요소 생성
            const newElement = document.createElement(value || 'p')
            newElement.innerHTML = content

            // 기존 요소를 새로운 요소로 교체
            element.parentNode?.replaceChild(newElement, element)

            // 커서 위치 복원
            const newRange = document.createRange()
            const newSelection = window.getSelection()
            newRange.selectNodeContents(newElement)
            newRange.collapse(false)
            newSelection?.removeAllRanges()
            newSelection?.addRange(newRange)
          } else {
            // 블록 요소가 없으면 새로 생성
            const selectedText = selection.toString() || ''
            const newElement = document.createElement(value || 'p')

            if (selectedText) {
              newElement.textContent = selectedText
              range.deleteContents()
              range.insertNode(newElement)
            } else {
              newElement.innerHTML = '<br>'
              range.insertNode(newElement)
              // 커서를 새 요소 안으로 이동
              const newRange = document.createRange()
              newRange.setStart(newElement, 0)
              newRange.collapse(true)
              selection.removeAllRanges()
              selection.addRange(newRange)
            }
          }
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
            `<a to="${url}" target="_blank">${selectedText}</a>`
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
      // DOM 업데이트 후 상태 확인을 위해 setTimeout 사용
      setTimeout(() => {
        updateCurrentFormat()
      }, 0)
    } catch (error) {
      console.error('Command execution failed:', error)
    }
  }

  return (
    <div
      className={`bg-white rounded-md overflow-hidden ${showToolbar ? 'h-full flex flex-col' : 'h-full'}`}
    >
      {/* 툴바 - 조건부 렌더링 */}
      {showToolbar && (
        <div className="bg-gray-50 p-2 flex gap-1 flex-wrap flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              console.log('Bold button clicked')
              execCommand('bold')
              setTimeout(() => {
                const boldState =
                  checkFormatState('b') || checkFormatState('strong')
                console.log('Bold state after click:', boldState)
                setActiveFormats(prev => ({
                  ...prev,
                  bold: boldState,
                }))
              }, 50)
            }}
            className={`px-3 py-1 rounded text-caption-14 text-bold text-gray-700 ${
              activeFormats.bold ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="굵게"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Italic button clicked')
              execCommand('italic')
              setTimeout(() => {
                const italicState =
                  checkFormatState('i') || checkFormatState('em')
                console.log('Italic state after click:', italicState)
                setActiveFormats(prev => ({
                  ...prev,
                  italic: italicState,
                }))
              }, 50)
            }}
            className={`px-3 py-1 rounded text-caption-14 italic text-gray-700 ${
              activeFormats.italic ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="기울임"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Underline button clicked')
              execCommand('underline')
              setTimeout(() => {
                const underlineState = checkFormatState('u')
                console.log('Underline state after click:', underlineState)
                setActiveFormats(prev => ({
                  ...prev,
                  underline: underlineState,
                }))
              }, 50)
            }}
            className={`px-3 py-1 rounded text-caption-14 underline text-gray-700 ${
              activeFormats.underline ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="밑줄"
          >
            U
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h1')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'h1' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="제목 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h2')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'h2' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="제목 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h3')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'h3' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="제목 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h4')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'h4' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="제목 4"
          >
            H4
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h5')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'h5' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="제목 5"
          >
            H5
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'h6')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'h6' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="제목 6"
          >
            H6
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'p')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              currentFormat === 'p' ? 'bg-gray-100' : 'hover:bg-gray-100'
            }`}
            title="본문"
          >
            P
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              activeFormats.insertUnorderedList
                ? 'bg-gray-100'
                : 'hover:bg-gray-100'
            }`}
            title="불릿 목록"
          >
            • 목록
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className={`px-3 py-1 rounded text-caption-14 text-gray-700 ${
              activeFormats.insertOrderedList
                ? 'bg-gray-100'
                : 'hover:bg-gray-100'
            }`}
            title="번호 목록"
          >
            1. 목록
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* 색상 */}
          <label
            className="px-3 py-1 rounded text-caption-14 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
            title="글자 색상"
          >
            A
            <input
              type="color"
              onChange={e => handleColorChange(e.target.value)}
              className="w-4 h-4 ml-1 border-none cursor-pointer"
            />
          </label>

          <label
            className="px-3 py-1 rounded text-caption-14 text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
            title="배경 색상"
          >
            <PaintBrushIcon className="w-4 h-4" />
            <input
              type="color"
              onChange={e => handleBackgroundColorChange(e.target.value)}
              className="w-4 h-4 ml-1 border-none cursor-pointer"
            />
          </label>

          <div className="w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={handleLinkButtonClick}
            className="px-3 py-1 hover:bg-gray-100 rounded text-caption-14 text-gray-700 flex items-center"
            title="링크"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="px-3 py-1 hover:bg-gray-100 rounded text-caption-14 text-gray-700 cursor-pointer flex items-center"
            title="이미지"
            onClick={handleImageButtonClick}
          >
            <PhotoIcon className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            className="px-3 py-1 hover:bg-gray-100 rounded text-caption-14 text-gray-700"
            title="서식 제거"
          >
            <ScissorsIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={`max-w-none focus:outline-none p-4 overflow-auto ${showToolbar ? 'flex-1' : 'h-full'}`}
        onScroll={onScroll}
        style={{
          minHeight: typeof height === 'string' ? height : height,
          height: typeof height === 'string' ? height : height,
        }}
      />

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-semibold">링크 추가</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-medium mb-2">
                  링크 이름
                </label>
                <input
                  type="text"
                  value={linkData.name}
                  onChange={e =>
                    setLinkData({ ...linkData, name: e.target.value })
                  }
                  placeholder="링크 텍스트를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm text-medium mb-2">URL</label>
                <input
                  type="url"
                  value={linkData.url}
                  onChange={e =>
                    setLinkData({ ...linkData, url: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                취소
              </button>
              <button
                onClick={handleAddLink}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
