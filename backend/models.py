from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class ParentAccount(Base):
    __tablename__ = "parent_accounts"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    kvkk_consent = Column(Boolean, default=False, nullable=False)
    consent_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    profiles = relationship("ChildProfile", back_populates="parent", cascade="all, delete-orphan")

class ChildProfile(Base):
    __tablename__ = "child_profiles"
    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("parent_accounts.id"), nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String) 
    
    parent = relationship("ParentAccount", back_populates="profiles")

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    emoji = Column(String, default="📖")
    content = Column(String, nullable=False)

class ChildBookProgress(Base):
    __tablename__ = "child_book_progress"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_profiles.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    progress = Column(Integer, default=0) # Stores percentage (0 to 100)
    
    # This relationship allows us to fetch the actual book details easily
    book = relationship("Book")

class ReadingSession(Base):
    __tablename__ = "reading_sessions"
    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("child_profiles.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    missed_words = Column(String, default="") # Saved as a comma-separated string
    total_words = Column(Integer, default=0)
    book = relationship("Book")