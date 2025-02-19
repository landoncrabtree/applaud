import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'

const markdownComponents: Components = {
  h1: ({children}) => <h1 className="text-2xl font-bold my-4">{children}</h1>,
  h2: ({children}) => <h2 className="text-xl font-bold my-3">{children}</h2>,
  h3: ({children}) => <h3 className="text-lg font-bold my-2">{children}</h3>,
  p: ({children}) => <p className="my-2">{children}</p>,
  ul: ({children}) => <ul className="list-disc pl-4 my-2">{children}</ul>,
  ol: ({children}) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
  li: ({children}) => <li className="my-1">{children}</li>,
  blockquote: ({children}) => (
    <blockquote className="border-l-4 border-gray-200 dark:border-gray-700 pl-4 my-2 italic">{children}</blockquote>
  ),
  code: ({children}) => (
    <code className="bg-gray-100 dark:bg-gray-800 rounded px-1">{children}</code>
  ),
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown 
      className="text-gray-700 dark:text-gray-300"
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  )
} 