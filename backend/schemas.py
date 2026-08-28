from pydantic import BaseModel, EmailStr
from typing import List, Optional

class ProfileCreate(BaseModel):
    name: str
    avatar_url: str

class ProfileResponse(ProfileCreate):
    id: int
    class Config:
        from_attributes = True

class ParentCreate(BaseModel):
    email: EmailStr
    password: str
    kvkk_consent: bool

class ParentResponse(BaseModel):
    id: int
    email: EmailStr
    profiles: List[ProfileResponse] = []
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class BookResponse(BaseModel):
    id: int
    title: str
    emoji: str
    content: str
    
    class Config:
        from_attributes = True

class ChildBookProgressResponse(BaseModel):
    id: int
    child_id: int
    book_id: int
    progress: int
    book: BookResponse
    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    missed_words: str
    total_words: int

class ReadingSessionResponse(BaseModel):
    id: int
    child_id: int
    book_id: int
    missed_words: str
    total_words: int
    book: BookResponse
    class Config:
        from_attributes = True