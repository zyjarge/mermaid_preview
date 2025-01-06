import CodeMirror from '@uiw/react-codemirror'
import { mermaid } from '@core/lib/mermaid/lang'
import { useTheme } from '@core/lib/theme/provider'

export interface EditorProps {
    code: string
    onChange?: (code: string) => void
}

export function Editor({ code, onChange }: EditorProps) {
    const { theme } = useTheme()

    return (
        <div className="w-full h-full flex">
            <CodeMirror
                value={code}
                height="100%"
                className="flex-1 overflow-auto"
                theme={theme === 'dark' ? 'dark' : 'light'}
                extensions={[mermaid()]}
                onChange={onChange}
            />
        </div>
    )
} 