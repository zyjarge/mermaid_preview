// 主题类型
export type Theme = 'light' | 'dark' | 'system'

// 组件通用属性
export interface BaseProps {
    className?: string
}

// 编辑器属性
export interface EditorProps extends BaseProps {
    value: string
    onChange: (value: string) => void
}

// 预览属性
export interface PreviewProps extends BaseProps {
    code: string
}

// 导出按钮属性
export interface ExportButtonsProps {
    previewRef: React.RefObject<HTMLDivElement>
}

// 主题切换属性
export interface ThemeToggleProps extends BaseProps {
    onThemeChange?: (theme: Theme) => void
} 