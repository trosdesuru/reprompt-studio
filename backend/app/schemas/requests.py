from pydantic import BaseModel


class DescargaRequest(BaseModel):
    url: str
    title: str

class DescargaUnaRequest(BaseModel):
    url_img: str
    title: str
    index: int