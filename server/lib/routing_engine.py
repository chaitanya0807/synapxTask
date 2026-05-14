from typing import Optional

MANDATORY_FIELDS = [
    "policyNumber",
    "policyholderName",
    "incidentDate",
    "incidentLocation",
    "incidentDescription",
    "claimantName",
    "assetId",
    "claimType",
]


def route_claim(fields: dict) -> dict:
    missing_fields = [
        f for f in MANDATORY_FIELDS
        if fields.get(f) is None or fields.get(f) == ""
    ]

    # Rule 1: FRAUD
    import re
    fraud_match = re.compile(r"fraud|staged|inconsistent|suspicious", re.IGNORECASE)
    desc = fields.get("incidentDescription") or ""
    if desc and fraud_match.search(desc):
        word = fraud_match.search(desc).group()
        return {
            "recommendedRoute": "investigation-flag",
            "reasoning": f'Detected flagged keyword "{word}" in incident description.',
            "missingFields": missing_fields,
        }

    # Rule 2: INJURY
    injury_match = re.compile(r"injur|bodily|personal injury", re.IGNORECASE)
    claim_type = fields.get("claimType") or ""
    if claim_type and injury_match.search(claim_type):
        return {
            "recommendedRoute": "specialist-queue",
            "reasoning": "Claim classified as injury/bodily harm.",
            "missingFields": missing_fields,
        }

    # Rule 3: MISSING
    if missing_fields:
        return {
            "recommendedRoute": "manual-review",
            "reasoning": f"Missing mandatory fields: {', '.join(missing_fields)}.",
            "missingFields": missing_fields,
        }

    # Rule 4: FAST TRACK
    damage = fields.get("estimatedDamage")
    if isinstance(damage, (int, float)) and damage < 25000:
        return {
            "recommendedRoute": "fast-track",
            "reasoning": f"Estimated damage ${damage} is below fast-track threshold.",
            "missingFields": missing_fields,
        }

    # Rule 5: DEFAULT
    return {
        "recommendedRoute": "manual-review",
        "reasoning": "Damage amount exceeds fast-track threshold or is unspecified.",
        "missingFields": missing_fields,
    }
