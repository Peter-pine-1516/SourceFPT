import { Fragment, memo } from "react";

const INLINE_TOKEN_RE = /(<br\s*\/?>|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/gi;

function renderInlineMarkdown(text) {
  const parts = String(text).split(INLINE_TOKEN_RE);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^<br\s*\/?>$/i.test(part)) {
      return <br key={idx} />;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return <code key={idx}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}

export const StudyGuide = memo(function StudyGuide({ blocks }) {
  return (
    <article className="guide-card">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "h1":
            return <h1 key={idx}>{renderInlineMarkdown(block.text)}</h1>;
          case "h2":
            return (
              <h2 key={idx} id={block.id}>
                {renderInlineMarkdown(block.text)}
              </h2>
            );
          case "h3":
            return <h3 key={idx}>{renderInlineMarkdown(block.text)}</h3>;
          case "blockquote":
            return <blockquote key={idx}>{renderInlineMarkdown(block.text)}</blockquote>;
          case "ul":
            return (
              <ul key={idx}>
                {block.items.map((item, i) => (
                  <li key={i}>{renderInlineMarkdown(item)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={idx}>
                {block.items.map((item, i) => (
                  <li key={i}>{renderInlineMarkdown(item)}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={idx} className="guide-table-wrap">
                <table className="guide-table">
                  <thead>
                    <tr>
                      {block.header.map((cell, ci) => (
                        <th key={ci}>{renderInlineMarkdown(cell)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.body.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td key={ci}>{renderInlineMarkdown(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return <p key={idx}>{renderInlineMarkdown(block.text)}</p>;
        }
      })}
    </article>
  );
});
