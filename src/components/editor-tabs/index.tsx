import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Editor } from '@/components/editor'
import { AIExplanation } from '@/components/ai-explanation'
import { Settings } from '@/components/settings'
import type { EditorProps } from '@/types'

interface EditorTabsProps extends EditorProps {
    className?: string
}

export function EditorTabs({ value, onChange, className }: EditorTabsProps) {
    const [activeTab, setActiveTab] = React.useState('editor')

    return (
        <Tabs
            defaultValue="editor"
            value={activeTab}
            onValueChange={setActiveTab}
            className={`h-full flex flex-col ${className || ''}`}
        >
            <div className="border-b px-4 py-2 bg-gray-50 dark:bg-gray-900">
                <TabsList className="grid w-[600px] grid-cols-3">
                    <TabsTrigger value="editor" className="text-sm">
                        代码编辑
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="text-sm">
                        AI 解释
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-sm">
                        系统设置
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 mt-0">
                <Editor value={value} onChange={onChange} className="h-full" />
            </TabsContent>

            <TabsContent value="ai" className="flex-1 mt-0">
                <AIExplanation code={value} className="h-full" />
            </TabsContent>

            <TabsContent value="settings" className="flex-1 mt-0">
                <Settings className="h-full" />
            </TabsContent>
        </Tabs>
    )
} 