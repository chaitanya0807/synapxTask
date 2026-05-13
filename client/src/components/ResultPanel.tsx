import RouteBadge from "./RouteBadge";
import FieldsGrid from "./FieldsGrid";
import JsonViewer from "./JsonViewer";

interface ResultPanelProps {
  result: {
    extractedFields: Record<string, any>;
    missingFields: string[];
    recommendedRoute: "fast-track" | "manual-review" | "investigation-flag" | "specialist-queue";
    reasoning: string;
  };
  onReset: () => void;
}

function ResultPanel({ result, onReset }: ResultPanelProps) {
  const { extractedFields, missingFields, recommendedRoute, reasoning } = result;

  return (
    <div className="space-y-6">
      {/* Missing fields banner */}
      {missingFields.length > 0 && (
        <div className="bg-yellow-950/40 border border-yellow-700 rounded-lg p-4">
          <p className="text-yellow-300 text-sm font-semibold mb-2">
            ⚠ {missingFields.length} mandatory field{missingFields.length !== 1 ? "s" : ""} missing
          </p>
          <div className="flex flex-wrap gap-2">
            {missingFields.map((f) => (
              <span key={f} className="bg-yellow-900 text-yellow-300 text-xs px-2 py-1 rounded">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Route badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Recommended Route:</span>
        <RouteBadge route={recommendedRoute} />
      </div>

      {/* Reasoning */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-1">Reasoning</h3>
        <p className="text-gray-200">{reasoning}</p>
      </div>

      {/* Extracted fields */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Extracted Fields</h3>
        <FieldsGrid fields={extractedFields} missingFields={missingFields} />
      </div>

      {/* JSON viewer */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Raw JSON</h3>
        <JsonViewer data={result} />
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-lg font-semibold bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        Process another claim
      </button>
    </div>
  );
}

export default ResultPanel;
