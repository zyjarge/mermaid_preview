import { useEffect } from 'react'
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
        <div className="w-full h-full">
            <CodeMirror
                value={code}
                height="100%"
                theme={theme === 'dark' ? 'dark' : 'light'}
                extensions={[mermaid()]}
                onChange={onChange}
            />
        </div>
    )
} 