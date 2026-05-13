const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { z } = require("zod");

const claimSchema = z.object({
  policyNumber: z.string().nullable(),
  policyholderName: z.string().nullable(),
  effectiveStartDate: z.string().nullable(),
  effectiveEndDate: z.string().nullable(),
  incidentDate: z.string().nullable(),
  incidentTime: z.string().nullable(),
  incidentLocation: z.string().nullable(),
  incidentDescription: z.string().nullable(),
  claimantName: z.string().nullable(),
  thirdParties: z.array(z.string()),
  contactDetails: z.string().nullable(),
  assetType: z.string().nullable(),
  assetId: z.string().nullable(),
  estimatedDamage: z.number().nullable(),
  claimType: z.string().nullable(),
  initialEstimate: z.number().nullable(),
});

const parser = StructuredOutputParser.fromZodSchema(claimSchema);

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are an insurance FNOL data extraction expert. Extract all fields from the document. Return ONLY valid JSON matching the schema. {format_instructions}",
  ],
  ["human", "Extract fields from this FNOL document:\n\n{document}"],
]);

let chain = null;

function getChain() {
  if (!chain) {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      temperature: 0,
    });
    chain = RunnableSequence.from([prompt, model, parser]);
  }
  return chain;
}

async function extractClaimFields(rawText) {
  return await getChain().invoke({
    document: rawText,
    format_instructions: parser.getFormatInstructions(),
  });
}

module.exports = { extractClaimFields };
