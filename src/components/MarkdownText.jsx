// The model answers in markdown, but the chat bubble rendered it verbatim, so
// a list came out as literal "* **Amelia**: amelia@example.com".
//
// This covers the small subset Gemini actually emits: bold, inline code, and
// bullet/numbered lists. It builds React elements instead of setting innerHTML,
// so a username that happens to contain markup can never become markup.

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

const renderInline = (text, keyPrefix) =>
  text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;

      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
        return <strong key={key}>{part.slice(2, -2)}</strong>;
      }

      if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={key} className="bg-black/10 rounded px-1 text-[0.9em]">
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={key}>{part}</span>;
    });

const toBlocks = (text) => {
  const blocks = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", lines: para });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: "list", ...list });
      list = null;
    }
  };

  for (const line of text.split("\n")) {
    // A marker only counts with whitespace after it, so "**bold**" at the
    // start of a line is not mistaken for a bullet.
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (bullet) {
      flushPara();
      if (!list || list.ordered) {
        flushList();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }

    if (numbered) {
      flushPara();
      if (!list || !list.ordered) {
        flushList();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
      continue;
    }

    if (!line.trim()) {
      flushPara();
      flushList();
      continue;
    }

    flushList();
    para.push(line);
  }

  flushPara();
  flushList();
  return blocks;
};

export function MarkdownText({ children }) {
  const blocks = toBlocks(String(children ?? ""));

  return (
    <div className="flex flex-col gap-y-2">
      {blocks.map((block, bi) => {
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={bi}
              className={`pl-5 flex flex-col gap-y-1 ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, `${bi}-${ii}`)}</li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={bi} className="whitespace-pre-wrap">
            {block.lines.map((line, li) => (
              <span key={li}>
                {li > 0 ? "\n" : null}
                {renderInline(line, `${bi}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
