# FNOL Intelligence Agent

## Overview

FNOL Intelligence Agent automates First Notice of Loss claim processing by extracting structured data from uploaded PDF/TXT documents using Gemini Flash 2.5, then routing claims to the appropriate queue based on business rules. It combines AI-powered extraction with deterministic routing logic to accelerate insurance claim triage.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite + TypeScript | Upload UI, result display, loading states |
| Styling | Tailwind CSS | Dark-themed responsive layout |
| Backend | Node.js + Express (CommonJS) | REST API, file upload, orchestration |
| File Upload | Multer | In-memory PDF/TXT handling (10MB max) |
| PDF Parsing | pdf-parse | Text extraction from PDF buffers |
| AI Extraction | LangChain + Gemini 2.5 Flash | Structured FNOL field extraction |
| Schema Validation | Zod | Claim schema definition & output parsing |
| Routing | Custom engine | Rule-based claim routing |

## Architecture

```
┌──────────────┐     POST /api/process-claim      ┌──────────────┐
│              │  ─────────────────────────────▶   │              │
│   React UI   │       (multipart/form-data)       │   Express    │
│  (Vite:5173) │                                   │  (Port:3001) │
│              │  ◀─────────────────────────────   │              │
└──────────────┘     JSON response                └──────┬───────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    ▼                ▼                ▼
                             ┌──────────┐    ┌──────────────┐  ┌───────────┐
                             │ pdfParse │    │  LangChain   │  │ Routing   │
                             │  (text)  │    │ + Gemini 2.5 │  │  Engine   │
                             └────┬─────┘    │   Flash      │  └───────────┘
                                  │          └──────┬───────┘
                                  │                 │
                                  └────────┬────────┘
                                           ▼
                                    Structured JSON
                                    (claim fields)
```

## Setup

```bash
git clone <repo-url>
cd fnol-agent

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Create server/.env
echo "GOOGLE_API_KEY=your_gemini_api_key" > server/.env
echo "PORT=3001" >> server/.env

# Create client/.env
echo "VITE_API_URL=http://localhost:3001" > client/.env

# Run both servers from root
cd .. && npm run dev
```

## Routing Logic

| Condition | Route | Reasoning |
|-----------|-------|-----------|
| `incidentDescription` matches `fraud\|staged\|inconsistent\|suspicious` | `investigation-flag` | Flagged keyword detected in description |
| `claimType` matches `injur\|bodily\|personal injury` | `specialist-queue` | Injury/bodily harm claim |
| Mandatory fields missing | `manual-review` | Missing fields require human input |
| `estimatedDamage` < $25,000 | `fast-track` | Below fast-track threshold |
| Default (damage ≥ $25k or unspecified) | `manual-review` | Exceeds threshold or unspecified |

## API Reference

### `POST /api/process-claim`

Upload a PDF or TXT file for FNOL processing.

- **Content-Type**: `multipart/form-data`
- **Field**: `file` (PDF or TXT, max 10MB)

**Response (200)**:

```json
{
  "extractedFields": {
    "policyNumber": "string | null",
    "policyholderName": "string | null",
    "effectiveStartDate": "string | null",
    "effectiveEndDate": "string | null",
    "incidentDate": "string | null",
    "incidentTime": "string | null",
    "incidentLocation": "string | null",
    "incidentDescription": "string | null",
    "claimantName": "string | null",
    "thirdParties": ["string"],
    "contactDetails": "string | null",
    "assetType": "string | null",
    "assetId": "string | null",
    "estimatedDamage": "number | null",
    "claimType": "string | null",
    "initialEstimate": "number | null"
  },
  "missingFields": ["string"],
  "recommendedRoute": "fast-track | manual-review | investigation-flag | specialist-queue",
  "reasoning": "string"
}
```

**Error Responses**:
- `400` — No file uploaded, or document appears empty/unreadable
- `500` — PDF parsing failed, or AI extraction error

### `GET /api/health`

Returns `{ "status": "ok" }`

## Sample JSON Output

```json
{
  "extractedFields": {
    "policyNumber": "AC-123456789",
    "policyholderName": "John A. Smith",
    "effectiveStartDate": "01/01/2024",
    "effectiveEndDate": "01/01/2025",
    "incidentDate": "03/15/2024",
    "incidentTime": "14:30",
    "incidentLocation": "123 Main St, Springfield, IL",
    "incidentDescription": "Vehicle was rear-ended at stoplight by third party",
    "claimantName": "John A. Smith",
    "thirdParties": ["Jane Doe"],
    "contactDetails": "(555) 123-4567",
    "assetType": "Automobile",
    "assetId": "VIN-1HGBH41JXMN109186",
    "estimatedDamage": 15000,
    "claimType": "Property Damage",
    "initialEstimate": 14500
  },
  "missingFields": [],
  "recommendedRoute": "fast-track",
  "reasoning": "Estimated damage $15000 is below fast-track threshold."
}
```

## Folder Structure

```
synapx/
├── package.json                  # Root scripts (dev, dev:server, dev:client)
├── README.md
├── ACORD-Automobile-Loss-Notice-12.05.16.pdf
├── Assessment_Brief_Synapx.pdf
├── server/
│   ├── .env                      # GOOGLE_API_KEY, PORT
│   ├── package.json
│   ├── index.js                  # Express entry point
│   ├── routes/
│   │   └── claims.js             # POST /process-claim, GET /health
│   ├── lib/
│   │   ├── pdfParser.js          # PDF/TXT text extraction
│   │   ├── langchainChain.js     # Gemini 2.5 Flash + Zod structured output
│   │   └── routingEngine.js      # Rule-based claim routing
│   └── sample-docs/
│       ├── complete-claim.txt
│       └── missing-fields-claim.txt
└── client/
    ├── .env                      # VITE_API_URL
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx               # Main page + loading skeleton + error toast
        ├── index.css
        └── components/
            ├── UploadZone.tsx    # react-dropzone upload area
            ├── ResultPanel.tsx   # Results display + missing fields banner
            ├── RouteBadge.tsx    # Color-coded route pill with icon
            ├── FieldsGrid.tsx    # 2-column field grid
            └── JsonViewer.tsx    # Syntax-highlighted JSON with copy
```
