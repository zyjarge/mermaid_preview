import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { cn } from '@core/lib/utils';

interface MarkdownPreviewProps {
    code: string;
    className?: string;
}

export function MarkdownPreview({ code, className = '' }: MarkdownPreviewProps) {
    return (
        <div className={cn('markdown-preview prose dark:prose-invert max-w-none p-4', className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
                {code}
            </ReactMarkdown>
        </div>
    );
} 