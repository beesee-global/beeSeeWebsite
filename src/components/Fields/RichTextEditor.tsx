import React, { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Undo, 
  Redo,
  Link2,
  X,
  Minus,
  Image,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

interface MediaToolbar {
  element: HTMLElement
  top: number
  left: number
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<Set<string>>(new Set())
  const [mediaToolbar, setMediaToolbar] = useState<MediaToolbar | null>(null)
  const savedSelection = useRef<Range | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const mediaToolbarRef = useRef<HTMLDivElement>(null)

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'i', 'b',
        'ul', 'ol', 'li',
        'a',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'hr',
        // Media & layout — required for image/video alignment support
        'div', 'img', 'video', 'source',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'src', 'alt', 'controls', 'type'],
      ALLOW_DATA_ATTR: false,
    })
  }

  const toHtmlWithLists = (rawText: string) => {
    const lines = rawText.replace(/\r\n/g, '\n').split('\n')
    const out: string[] = []
    let inOl = false
    let inUl = false
    let orderedCount = 0

    const closeLists = () => {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
    }

    for (const line of lines) {
      const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/)
      const bulletMatch = line.match(/^\s*[*-]\s+(.*)$/)

      if (orderedMatch) {
        if (inUl) { out.push('</ul>'); inUl = false }
        if (!inOl) { out.push(orderedCount > 0 ? `<ol start="${orderedCount + 1}">` : '<ol>'); inOl = true }
        orderedCount += 1
        out.push(`<li>${escapeHtml(orderedMatch[1])}</li>`)
        continue
      }

      if (bulletMatch) {
        if (inOl) { out.push('</ol>'); inOl = false }
        if (!inUl) { out.push('<ul>'); inUl = true }
        out.push(`<li>${escapeHtml(bulletMatch[1])}</li>`)
        continue
      }

      closeLists()
      if (line.trim()) {
        out.push(`<p>${escapeHtml(line)}</p>`)
      } else {
        out.push('<p><br></p>')
      }
    }

    closeLists()
    return out.join('')
  }

  const normalizeEditorValue = (input: string) => {
    if (!input) return ''
    const hasHtml = /<[^>]+>/.test(input)
    if (hasHtml) return input
    const looksLikeList = /^\s*(\d+\.\s+|[*-]\s+)/m.test(input)
    if (!looksLikeList) return input
    return toHtmlWithLists(input)
  }

  const normalizeOrderedListStarts = (container: HTMLElement) => {
    let orderedCount = 0
    const children = Array.from(container.children)
    for (const child of children) {
      if (child.tagName === 'OL') {
        const liCount = Array.from(child.children).filter((node) => node.tagName === 'LI').length
        if (orderedCount > 0) child.setAttribute('start', String(orderedCount + 1))
        else child.removeAttribute('start')
        orderedCount += liCount
        continue
      }
      if (child.tagName === 'UL') continue
      if ((child.textContent || '').trim() === '') continue
      orderedCount = 0
    }
  }

  useEffect(() => {
    if (!editorRef.current) return
    const normalizedValue = sanitizeHTML(normalizeEditorValue(value))
    if (editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue
    }
  }, [value])

  // Close media toolbar when clicking outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (
        mediaToolbar &&
        mediaToolbarRef.current &&
        !mediaToolbarRef.current.contains(e.target as Node) &&
        (e.target as HTMLElement).tagName !== 'IMG' &&
        (e.target as HTMLElement).tagName !== 'VIDEO'
      ) {
        setMediaToolbar(null)
        editorRef.current?.querySelectorAll('.media-selected').forEach(el => el.classList.remove('media-selected'))
      }
    }
    document.addEventListener('mousedown', handleDocClick)
    return () => document.removeEventListener('mousedown', handleDocClick)
  }, [mediaToolbar])

  const execCommand = (command: string, val?: string) => {
    if (editorRef.current) editorRef.current.focus()
    document.execCommand(command, false, val)
    setTimeout(() => { updateContent(); updateActiveFormats() }, 10)
  }

  const updateContent = () => {
    if (editorRef.current) {
      normalizeOrderedListStarts(editorRef.current)
      onChange(sanitizeHTML(editorRef.current.innerHTML))
    }
  }

  const updateActiveFormats = () => {
    const formats = new Set<string>()
    try {
      if (document.queryCommandState('bold')) formats.add('bold')
      if (document.queryCommandState('italic')) formats.add('italic')
      if (document.queryCommandState('underline')) formats.add('underline')
      if (document.queryCommandState('insertUnorderedList')) formats.add('bulletList')
      if (document.queryCommandState('insertOrderedList')) formats.add('orderedList')
      if (document.queryCommandState('justifyLeft')) formats.add('left')
      if (document.queryCommandState('justifyCenter')) formats.add('center')
      if (document.queryCommandState('justifyRight')) formats.add('right')
      if (document.queryCommandState('justifyFull')) formats.add('justify')
    } catch (e) {}
    setSelectedFormat(formats)
  }

  const handleInput = () => updateContent()
  const handleKeyUp = () => updateActiveFormats()
  const handleMouseUp = () => updateActiveFormats()

  const handleClick = (e: React.MouseEvent) => {
    updateActiveFormats()
    const target = e.target as HTMLElement
    const isMedia = target.tagName === 'IMG' || target.tagName === 'VIDEO'

    if (isMedia) {
      e.preventDefault()
      editorRef.current?.querySelectorAll('.media-selected').forEach(el => el.classList.remove('media-selected'))
      target.classList.add('media-selected')

      const editorRect = editorRef.current!.getBoundingClientRect()
      const mediaRect = target.getBoundingClientRect()

      setMediaToolbar({
        element: target,
        top: mediaRect.top - editorRect.top - 48,
        left: mediaRect.left - editorRect.left,
      })
    } else {
      setMediaToolbar(null)
      editorRef.current?.querySelectorAll('.media-selected').forEach(el => el.classList.remove('media-selected'))
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const normalized = normalizeEditorValue(text)
    document.execCommand('insertHTML', false, normalized)
    updateContent()
  }

  const insertLink = () => {
    if (linkUrl) {
      if (savedSelection.current) {
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(savedSelection.current)
        }
      }
      execCommand('createLink', linkUrl)
      setShowLinkDialog(false)
      setLinkUrl('')
      savedSelection.current = null
    }
  }

  const openLinkDialog = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0).cloneRange()
    }
    setShowLinkDialog(true)
  }

  const toggleList = (type: 'ul' | 'ol') => {
    if (editorRef.current) editorRef.current.focus()
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
    document.execCommand(command, false)
    setTimeout(() => {
      updateContent()
      updateActiveFormats()
      if (editorRef.current) {
        editorRef.current.querySelectorAll('ul, ol').forEach(list => {
          if (!list.hasAttribute('style')) {
            list.setAttribute('style', list.tagName === 'UL'
              ? 'list-style-type: disc; padding-left: 40px;'
              : 'list-style-type: decimal; padding-left: 40px;')
          }
        })
        updateContent()
      }
    }, 10)
  }

  // Align a media element by adjusting its margin
  const alignMedia = (align: 'left' | 'center' | 'right') => {
    if (!mediaToolbar?.element) return
    const el = mediaToolbar.element

    // Find the closest wrapper div inside the editor
    let wrapper = el.parentElement
    while (wrapper && wrapper !== editorRef.current && wrapper.tagName !== 'DIV') {
      wrapper = wrapper.parentElement
    }

    // Use the wrapper div if it's a direct media wrapper, otherwise fall back to styling the element itself
    const target: HTMLElement = (wrapper && wrapper !== editorRef.current) ? wrapper : el

    // Apply text-align to the wrapper — this is the only reliable way to align
    // block-level replaced elements (img/video) that stretch to full width
    target.style.textAlign = align

    // Also reset any leftover margin-based alignment
    el.style.marginLeft = ''
    el.style.marginRight = ''

    updateContent()

    // Reposition toolbar after layout settles
    setTimeout(() => {
      if (!editorRef.current || !mediaToolbar) return
      const editorRect = editorRef.current.getBoundingClientRect()
      const mediaRect = el.getBoundingClientRect()
      setMediaToolbar(prev => prev ? {
        ...prev,
        top: mediaRect.top - editorRect.top - 48,
        left: mediaRect.left - editorRect.left,
      } : null)
    }, 30)
  }

  const alignText = (command: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull') => {
    execCommand(command)
  }

  const handleImageButtonClick = () => imageInputRef.current?.click()

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand('insertHTML', false,
          `<div style="text-align:left; margin:0.5em 0;"><img src="${dataUrl}" alt="${escapeHtml(file.name)}" style="max-width:100%; height:auto; display:inline-block;" /></div>`)
        updateContent()
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleVideoButtonClick = () => videoInputRef.current?.click()

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand('insertHTML', false,
          `<div style="text-align:left; margin:0.5em 0;"><video controls style="max-width:100%; height:auto; display:inline-block;">
            <source src="${dataUrl}" type="${file.type}" />
            Your browser does not support the video tag.
          </video></div>`)
        updateContent()
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const isActive = (format: string) => selectedFormat.has(format)

  const ToolbarButton = ({ onClick, icon: Icon, title, active = false }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
      }`}
    >
      <Icon size={18} />
    </button>
  )

  return (
    <div className="w-full max-w-8xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFileChange} />
      <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoFileChange} />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold (Ctrl+B)" active={isActive('bold')} />
        <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic (Ctrl+I)" active={isActive('italic')} />
        <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline (Ctrl+U)" active={isActive('underline')} />

        <div className="w-px bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <ToolbarButton onClick={() => alignText('justifyLeft')} icon={AlignLeft} title="Align Left" active={isActive('left')} />
        <ToolbarButton onClick={() => alignText('justifyCenter')} icon={AlignCenter} title="Align Center" active={isActive('center')} />
        <ToolbarButton onClick={() => alignText('justifyRight')} icon={AlignRight} title="Align Right" active={isActive('right')} />
        <ToolbarButton onClick={() => alignText('justifyFull')} icon={AlignJustify} title="Justify" active={isActive('justify')} />

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => toggleList('ul')} icon={List} title="Bullet List" active={isActive('bulletList')} />
        <ToolbarButton onClick={() => toggleList('ol')} icon={ListOrdered} title="Numbered List" active={isActive('orderedList')} />

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={openLinkDialog} icon={Link2} title="Insert Link" />
        <ToolbarButton onClick={() => execCommand('insertHorizontalRule')} icon={Minus} title="Insert Horizontal Line" />
        <ToolbarButton onClick={handleImageButtonClick} icon={Image} title="Insert Image" />
        <ToolbarButton onClick={handleVideoButtonClick} icon={Video} title="Insert Video" />

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => execCommand('removeFormat')} icon={X} title="Clear Formatting" />

        <div className="w-px bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Undo (Ctrl+Z)" />
        <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Redo (Ctrl+Y)" />
      </div>

      {/* Editor Area */}
      <div className="relative">
        {/* Floating Media Alignment Toolbar */}
        {mediaToolbar && (
          <div
            ref={mediaToolbarRef}
            className="absolute z-20 flex items-center gap-0.5 px-2 py-1.5 bg-gray-800 rounded-lg shadow-xl"
            style={{ top: Math.max(6, mediaToolbar.top), left: mediaToolbar.left }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <span className="text-gray-400 text-xs pr-1.5 select-none border-r border-gray-600 mr-1">Align media</span>
            <button
              type="button"
              title="Align Left"
              onClick={() => alignMedia('left')}
              className="p-1.5 rounded text-white hover:bg-gray-600 transition-colors"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              title="Align Center"
              onClick={() => alignMedia('center')}
              className="p-1.5 rounded text-white hover:bg-gray-600 transition-colors"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              title="Align Right"
              onClick={() => alignMedia('right')}
              className="p-1.5 rounded text-white hover:bg-gray-600 transition-colors"
            >
              <AlignRight size={14} />
            </button>
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          className="p-4 min-h-[300px] focus:outline-none"
          onInput={handleInput}
          onKeyUp={handleKeyUp}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onPaste={handlePaste}
          suppressContentEditableWarning
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word', lineHeight: '1.6' }}
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') insertLink()
                if (e.key === 'Escape') setShowLinkDialog(false)
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowLinkDialog(false); setLinkUrl('') }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                Cancel
              </button>
              <button onClick={insertLink} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        [contenteditable] ul { list-style-type: disc; padding-left: 40px; margin: 1em 0; }
        [contenteditable] ol { list-style-type: decimal; padding-left: 40px; margin: 1em 0; }
        [contenteditable] li { margin: 0.5em 0; }
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        [contenteditable] h4 { font-size: 1em; font-weight: bold; margin: 1em 0; }
        [contenteditable] h5 { font-size: 0.83em; font-weight: bold; margin: 1.17em 0; }
        [contenteditable] h6 { font-size: 0.67em; font-weight: bold; margin: 1.33em 0; }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] hr { border: none; border-top: 2px solid #ccc; margin: 1em 0; }
        [contenteditable] img {
          max-width: 100%; height: auto; display: inline-block;
          border-radius: 4px; cursor: pointer;
          transition: outline 0.12s;
        }
        [contenteditable] video {
          max-width: 100%; height: auto; display: inline-block;
          border-radius: 4px; cursor: pointer;
          transition: outline 0.12s;
        }
        [contenteditable] img.media-selected { outline: 2px solid #2563eb; outline-offset: 2px; }
        [contenteditable] video.media-selected { outline: 2px solid #2563eb; outline-offset: 2px; }
      `}</style>
    </div>
  )
}