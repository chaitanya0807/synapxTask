import pdfplumber
import io


async def extract_text(file_buffer: bytes, mimetype: str) -> str:
    if mimetype == "application/pdf":
        try:
            with pdfplumber.open(io.BytesIO(file_buffer)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
                return "\n".join(pages)
        except Exception as err:
            raise Exception(f"PDF parsing failed: {err}")
    if mimetype == "text/plain":
        return file_buffer.decode("utf-8")
    raise Exception("Unsupported file type. Upload PDF or TXT.")
