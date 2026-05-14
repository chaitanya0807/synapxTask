import os
from typing import Optional
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.runnables import RunnableSequence


class ClaimSchema(BaseModel):
    policyNumber: Optional[str] = None
    policyholderName: Optional[str] = None
    effectiveStartDate: Optional[str] = None
    effectiveEndDate: Optional[str] = None
    incidentDate: Optional[str] = None
    incidentTime: Optional[str] = None
    incidentLocation: Optional[str] = None
    incidentDescription: Optional[str] = None
    claimantName: Optional[str] = None
    thirdParties: list[str] = []
    contactDetails: Optional[str] = None
    assetType: Optional[str] = None
    assetId: Optional[str] = None
    estimatedDamage: Optional[float] = None
    claimType: Optional[str] = None
    initialEstimate: Optional[float] = None


parser = PydanticOutputParser(pydantic_object=ClaimSchema)

prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are an insurance FNOL data extraction expert. Extract all fields from the document. "
     "Return ONLY valid JSON matching the schema. {format_instructions}"),
    ("human", "Extract fields from this FNOL document:\n\n{document}"),
])

_chain = None


def _get_chain() -> RunnableSequence:
    global _chain
    if _chain is None:
        model = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0,
        )
        _chain = prompt | model | parser
    return _chain


async def extract_claim_fields(raw_text: str) -> ClaimSchema:
    chain = _get_chain()
    result = await chain.ainvoke({
        "document": raw_text,
        "format_instructions": parser.get_format_instructions(),
    })
    return result
