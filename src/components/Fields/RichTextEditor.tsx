import React, { useState, useEffect, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Undo, 
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Quote,
  X,
  Minus
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<Set<string>>(new Set()) 
  const savedSelection = useRef<Range | null>(null)

  const editorRef = useRef<HTMLDivElement>(null)

  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  const toHtmlWithLists = (rawText: string) => {
    const lines = rawText.replace(/\r\n/g, '\n').split('\n')
    const out: string[] = []
    let inOl = false
    let inUl = false
    let orderedCount = 0

    const closeLists = () => {
      if (inUl) {
        out.push('</ul>')
        inUl = false
      }
      if (inOl) {
        out.push('</ol>')
        inOl = false
      }
    }

    for (const line of lines) {
      const orderedMatch = line.match(/^\s*\d+\.\s+(.*)$/)
      const bulletMatch = line.match(/^\s*[*-]\s+(.*)$/)

      if (orderedMatch) {
        if (inUl) {
          out.push('</ul>')
          inUl = false
        }
        if (!inOl) {
          out.push(orderedCount > 0 ? `<ol start="${orderedCount + 1}">` : '<ol>')
          inOl = true
        }
        orderedCount += 1
        out.push(`<li>${escapeHtml(orderedMatch[1])}</li>`)
        continue
      }

      if (bulletMatch) {
        if (inOl) {
          out.push('</ol>')
          inOl = false
        }
        if (!inUl) {
          out.push('<ul>')
          inUl = true
        }
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
        if (orderedCount > 0) {
          child.setAttribute('start', String(orderedCount + 1))
        } else {
          child.removeAttribute('start')
        }
        orderedCount += liCount
        continue
      }

      if (child.tagName === 'UL') {
        continue
      }

      if ((child.textContent || '').trim() === '') {
        continue
      }

      // Reset numbering when a non-list content block appears.
      orderedCount = 0
    }
  }

  useEffect(() => {
    if (!editorRef.current) return

    // Only update if value is different to avoid cursor jumps
    const normalizedValue = normalizeEditorValue(value)
    if (editorRef.current.innerHTML !== normalizedValue) {
      editorRef.current.innerHTML = normalizedValue
    }
  }, [value])


  const execCommand = (command: string, val?: string) => {
    // Focus the editor first
    if (editorRef.current) {
      editorRef.current.focus()
    }
    
    // Execute command
    document.execCommand(command, false, val)
    
    // Small delay to ensure DOM updates before reading state
    setTimeout(() => {
      updateContent()
      updateActiveFormats()
    }, 10)
  }

  const updateContent = () => {
    if (editorRef.current) {
      normalizeOrderedListStarts(editorRef.current)
      onChange(editorRef.current.innerHTML)
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
    } catch (e) {
      // Some commands might not be available in all browsers
    }
    
    setSelectedFormat(formats)
  }

  const handleInput = () => {
    updateContent()
  }

  const handleKeyUp = () => {
    updateActiveFormats()
  }

  const handleMouseUp = () => {
    updateActiveFormats()
  }

  const handleClick = () => {
    updateActiveFormats()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    // Prevent default paste behavior
    e.preventDefault()
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain')
    const normalized = normalizeEditorValue(text)

    // Insert processed content at cursor position
    document.execCommand('insertHTML', false, normalized)
    
    // Update content
    updateContent()
  }

  const insertLink = () => {
    if (linkUrl) {
      // Restore the saved selection
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
    // Save the current selection
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelection.current = selection.getRangeAt(0).cloneRange()
    }
    setShowLinkDialog(true)
  }

  const formatBlock = (tag: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    document.execCommand('formatBlock', false, tag)
    setTimeout(() => {
      updateContent()
      updateActiveFormats()
    }, 10)
  }

  const toggleList = (type: 'ul' | 'ol') => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    
    const command = type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
    
    // Execute the command
    document.execCommand(command, false)
    
    // Force update after a brief delay
    setTimeout(() => {
      updateContent()
      updateActiveFormats()
      
      // Ensure list elements are properly formatted
      if (editorRef.current) {
        const lists = editorRef.current.querySelectorAll('ul, ol')
        lists.forEach(list => {
          // Ensure list has proper styling
          if (!list.hasAttribute('style')) {
            if (list.tagName === 'UL') {
              list.setAttribute('style', 'list-style-type: disc; padding-left: 40px;')
            } else {
              list.setAttribute('style', 'list-style-type: decimal; padding-left: 40px;')
            }
          }
        })
        updateContent()
      }
    }, 10)
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
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {/* Basic Formatting */}
        <ToolbarButton 
          onClick={() => execCommand('bold')} 
          icon={Bold} 
          title="Bold (Ctrl+B)"
          active={isActive('bold')}
        />
        <ToolbarButton 
          onClick={() => execCommand('italic')} 
          icon={Italic} 
          title="Italic (Ctrl+I)"
          active={isActive('italic')}
        />
        <ToolbarButton 
          onClick={() => execCommand('underline')} 
          icon={Underline} 
          title="Underline (Ctrl+U)"
          active={isActive('underline')}
        />
        
        <div className="w-px bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton 
          onClick={() => toggleList('ul')} 
          icon={List} 
          title="Bullet List"
          active={isActive('bulletList')}
        />
        <ToolbarButton 
          onClick={() => toggleList('ol')} 
          icon={ListOrdered} 
          title="Numbered List"
          active={isActive('orderedList')}
        /> 
        <div className="w-px bg-gray-300 mx-1" />

        {/* Insert */}
        <ToolbarButton 
          onClick={openLinkDialog} 
          icon={Link2} 
          title="Insert Link"
        />
        <ToolbarButton 
          onClick={() => execCommand('insertHorizontalRule')} 
          icon={Minus} 
          title="Insert Horizontal Line"
        />

        <div className="w-px bg-gray-300 mx-1" />

        {/* Clear Formatting */}
        <ToolbarButton 
          onClick={() => execCommand('removeFormat')} 
          icon={X} 
          title="Clear Formatting"
        />

        <div className="w-px bg-gray-300 mx-1" />

        {/* History */}
        <ToolbarButton 
          onClick={() => execCommand('undo')} 
          icon={Undo} 
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton 
          onClick={() => execCommand('redo')} 
          icon={Redo} 
          title="Redo (Ctrl+Y)"
        />
      </div>

      {/* Editor Area */}
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
        style={{ 
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: '1.6'
        }}
      />

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
              <button
                onClick={() => {
                  setShowLinkDialog(false)
                  setLinkUrl('')
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for proper list styling */}
      <style>{`
        [contenteditable] ul {
          list-style-type: disc;
          padding-left: 40px;
          margin: 1em 0;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
          padding-left: 40px;
          margin: 1em 0;
        }
        
        [contenteditable] li {
          margin: 0.5em 0;
        }
        
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
        [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
        [contenteditable] h4 { font-size: 1em; font-weight: bold; margin: 1em 0; }
        [contenteditable] h5 { font-size: 0.83em; font-weight: bold; margin: 1.17em 0; }
        [contenteditable] h6 { font-size: 0.67em; font-weight: bold; margin: 1.33em 0; }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #ccc;
          margin: 1em 0;
        }
      `}</style>
    </div>
  )
}
