from fastapi import APIRouter, UploadFile, File, HTTPException
from lib.pdf_parser import extract_text
from lib.langchain_chain import extract_claim_fields
from lib.routing_engine import route_claim

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/process-claim")
async def process_claim(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    contents = await file.read()
    mimetype = file.content_type or ""

    try:
        raw_text = await extract_text(contents, mimetype)
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

    if raw_text.strip().__len__() <= 50:
        raise HTTPException(status_code=400, detail="Document appears to be empty or unreadable.")

    try:
        extracted = await extract_claim_fields(raw_text)
        fields_dict = extracted.model_dump()
    except Exception as err:
        raise HTTPException(status_code=500, detail=str(err))

    result = route_claim(fields_dict)

    return {
        "extractedFields": fields_dict,
        "missingFields": result["missingFields"],
        "recommendedRoute": result["recommendedRoute"],
        "reasoning": result["reasoning"],
    }
