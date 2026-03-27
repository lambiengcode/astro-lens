'use client';

interface InterpretationProps {
  content: string;
}

function renderMarkdown(text: string): string {
  // Simple markdown to HTML conversion
  let html = text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border my-4"/>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newline (keep as break within context)
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li><br\/>?)+)/g, '<ul>$1</ul>');
  // Clean up stray <br/> in lists
  html = html.replace(/<\/li><br\/><li>/g, '</li><li>');
  html = html.replace(/<\/li><br\/><\/ul>/g, '</li></ul>');

  return `<p>${html}</p>`;
}

export default function Interpretation({ content }: InterpretationProps) {
  const html = renderMarkdown(content);

  return (
    <div className="bg-card border border-border rounded-xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gold mb-6 flex items-center gap-2">
        <span>✦</span> Luận Giải Chi Tiết
      </h2>
      <div
        className="prose-interpretation text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
