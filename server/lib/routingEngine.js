const MANDATORY_FIELDS = [
  "policyNumber",
  "policyholderName",
  "incidentDate",
  "incidentLocation",
  "incidentDescription",
  "claimantName",
  "assetId",
  "claimType",
];

function routeClaim(fields) {
  const missingFields = MANDATORY_FIELDS.filter(
    (f) => fields[f] === null || fields[f] === undefined || fields[f] === ""
  );

  // Rule 1: FRAUD
  const fraudMatch = /fraud|staged|inconsistent|suspicious/i;
  if (fields.incidentDescription && fraudMatch.test(fields.incidentDescription)) {
    const word = fields.incidentDescription.match(fraudMatch)[0];
    return {
      recommendedRoute: "investigation-flag",
      reasoning: `Detected flagged keyword "${word}" in incident description.`,
      missingFields,
    };
  }

  // Rule 2: INJURY
  const injuryMatch = /injur|bodily|personal injury/i;
  if (fields.claimType && injuryMatch.test(fields.claimType)) {
    return {
      recommendedRoute: "specialist-queue",
      reasoning: "Claim classified as injury/bodily harm.",
      missingFields,
    };
  }

  // Rule 3: MISSING
  if (missingFields.length > 0) {
    return {
      recommendedRoute: "manual-review",
      reasoning: `Missing mandatory fields: ${missingFields.join(", ")}.`,
      missingFields,
    };
  }

  // Rule 4: FAST TRACK
  if (typeof fields.estimatedDamage === "number" && fields.estimatedDamage < 25000) {
    return {
      recommendedRoute: "fast-track",
      reasoning: `Estimated damage $${fields.estimatedDamage} is below fast-track threshold.`,
      missingFields,
    };
  }

  // Rule 5: DEFAULT
  return {
    recommendedRoute: "manual-review",
    reasoning: "Damage amount exceeds fast-track threshold or is unspecified.",
    missingFields,
  };
}

module.exports = { routeClaim };
