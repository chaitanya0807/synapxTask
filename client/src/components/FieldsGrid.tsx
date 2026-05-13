interface FieldsGridProps {
  fields: Record<string, any>;
  missingFields: string[];
}

function camelToLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function FieldsGrid({ fields, missingFields }: FieldsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.entries(fields).map(([key, value]) => {
        const isMissing = missingFields.includes(key);
        const isEmpty = value === null || value === undefined || value === "";

        return (
          <div
            key={key}
            className={`rounded-lg p-3 ${isMissing ? "border border-red-800 bg-red-950/30" : "bg-gray-800"}`}
          >
            <span className="text-xs text-gray-500 uppercase tracking-wide">{camelToLabel(key)}</span>
            {isEmpty ? (
              <p className="text-sm text-red-400">—</p>
            ) : (
              <p className="text-sm text-gray-200 truncate">{String(value)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default FieldsGrid;
