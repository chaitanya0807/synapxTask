import { useState } from "react";

interface JsonViewerProps {
  data: object;
}

function highlight(json: string) {
  return json.replace(
    /("(?:[^"\\]|\\.)*")\s*:/g,
    '<span class="text-blue-400">$1</span>:'
  ).replace(
    /:\s*("(?:[^"\\]|\\.)*")/g,
    ': <span class="text-green-400">$1</span>'
  );
}

function JsonViewer({ data }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
      >
        {copied ? "Copied!" : "Copy JSON"}
      </button>
      <pre
        className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-gray-300"
        dangerouslySetInnerHTML={{ __html: highlight(json) }}
      />
    </div>
  );
}

export default JsonViewer;
