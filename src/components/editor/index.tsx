import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { mermaid } from '@/lib/mermaid-lang'
import { useTheme } from '@/lib/theme-provider'

interface EditorProps {
    value: string
    onChange: (value: string) => void
    className?: string
}

export function Editor({ value, onChange, className }: EditorProps) {
    const { theme } = useTheme()

    return (
        <div className={`h-full ${className}`}>
            <CodeMirror
                value={value}
                onChange={onChange}
                height="100%"
                theme={theme === 'dark' ? oneDark : undefined}
                extensions={[mermaid()]}
                basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightSpecialChars: true,
                    foldGutter: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightActiveLine: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    defaultKeymap: true,
                    searchKeymap: true,
                    historyKeymap: true,
                    foldKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                }}
                placeholder="在这里输入Mermaid图表代码..."
                className="h-full"
            />
        </div>
    )
} 