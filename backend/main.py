from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware # Add this import
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import models
import schemas
import auth
import audio
from database import engine, get_db
from typing import List
from pydantic import BaseModel

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add this CORS setup block right after app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # This allows your React app to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (keep all your existing routes below this)

# <-- Register the Phase 2 Audio Endpoints
app.include_router(audio.router) 

class ProgressUpdate(BaseModel):
    progress: int

@app.post("/auth/signup", response_model=schemas.ParentResponse, status_code=status.HTTP_201_CREATED)
def sign_up(user: schemas.ParentCreate, db: Session = Depends(get_db)):
    if not user.kvkk_consent:
        raise HTTPException(status_code=400, detail="KVKK Explicit Consent is required.")
    
    existing_user = db.query(models.ParentAccount).filter(models.ParentAccount.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
        
    new_parent = models.ParentAccount(
        email=user.email,
        password_hash=auth.get_password_hash(user.password),
        kvkk_consent=True
    )
    db.add(new_parent)
    db.commit()
    db.refresh(new_parent)
    return new_parent

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.ParentAccount).filter(models.ParentAccount.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.ParentResponse)
def get_parent_data(current_parent: models.ParentAccount = Depends(auth.get_current_parent)):
    return current_parent

@app.post("/auth/recover")
def recover_account(email: str, db: Session = Depends(get_db)):
    return {"message": "If that email is registered, a password reset link has been sent."}

@app.get("/profiles", response_model=List[schemas.ProfileResponse])
def get_profiles(
    current_parent: models.ParentAccount = Depends(auth.get_current_parent),
    db: Session = Depends(get_db)
):
    # Fetch all child profiles where the parent_id matches the logged-in parent
    profiles = db.query(models.ChildProfile).filter(models.ChildProfile.parent_id == current_parent.id).all()
    return profiles

@app.post("/profiles", response_model=schemas.ProfileResponse) # Removed the trailing slash here!
def add_child_profile(
    profile: schemas.ProfileCreate, 
    current_parent: models.ParentAccount = Depends(auth.get_current_parent), 
    db: Session = Depends(get_db)
):
    new_profile = models.ChildProfile(**profile.model_dump(), parent_id=current_parent.id)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@app.get("/books", response_model=List[schemas.BookResponse])
def get_all_books(
    current_parent: models.ParentAccount = Depends(auth.get_current_parent),
    db: Session = Depends(get_db)
):
    # Fetch all available books in the catalogue
    return db.query(models.Book).all()

@app.post("/books/seed")
def seed_books(db: Session = Depends(get_db)):
    # Check if books already exist so we don't duplicate them
    if db.query(models.Book).count() == 0:
        starter_books = [
            models.Book(
                title="The Little Red Hen", 
                emoji="🐔", 
                content="Once upon a time, there was a little red hen who lived on a farm. She asked her friends for help, but they all said no. So, she did it all by herself!"
            ),
            models.Book(
                title="Jack & the Beanstalk", 
                emoji="🌱", 
                content="Jack sold his cow for some magic beans. The beans grew into a giant beanstalk reaching high into the clouds."
            ),
            models.Book(
                title="Goldilocks", 
                emoji="🐻", 
                content="Goldilocks went into the woods and found a cozy little house. She tasted three bowls of porridge until she found one that was just right."
            ),
        ]
        db.add_all(starter_books)
        db.commit()
        return {"message": "Starter books added to the database successfully!"}
    
    return {"message": "Books already exist in the database. No duplicates added."}

# Add these below your other routes in backend/main.py

@app.get("/profiles/{child_id}/books", response_model=List[schemas.ChildBookProgressResponse])
def get_child_library(child_id: int, db: Session = Depends(get_db)):
    # Fetch all books downloaded by this specific child
    return db.query(models.ChildBookProgress).filter(models.ChildBookProgress.child_id == child_id).all()

@app.post("/profiles/{child_id}/books/{book_id}", response_model=schemas.ChildBookProgressResponse)
def download_book_for_child(child_id: int, book_id: int, db: Session = Depends(get_db)):
    # 1. Check if the child already downloaded this book to prevent duplicates
    existing_download = db.query(models.ChildBookProgress).filter_by(child_id=child_id, book_id=book_id).first()
    if existing_download:
        return existing_download
        
    # 2. Save the new download with 0% progress
    new_download = models.ChildBookProgress(child_id=child_id, book_id=book_id, progress=0)
    db.add(new_download)
    db.commit()
    db.refresh(new_download)
    return new_download

@app.delete("/auth/delete")
def delete_account(current_parent: models.ParentAccount = Depends(auth.get_current_parent), db: Session = Depends(get_db)):
    db.delete(current_parent)
    db.commit()
    return {"message": "Account and all associated child data deleted successfully."}

@app.patch("/profiles/{child_id}/books/{book_id}")
def update_reading_progress(
    child_id: int, 
    book_id: int, 
    update_data: ProgressUpdate, 
    db: Session = Depends(get_db)
):
    # Find the specific book in the child's library
    record = db.query(models.ChildBookProgress).filter_by(child_id=child_id, book_id=book_id).first()
    if record:
        record.progress = update_data.progress
        db.commit()
    return {"message": "Progress updated"}

@app.get("/profiles/{child_id}/sessions", response_model=List[schemas.ReadingSessionResponse])
def get_reading_sessions(child_id: int, db: Session = Depends(get_db)):
    # Fetches all reading sessions for this child, letting parents see the history
    return db.query(models.ReadingSession).filter(models.ReadingSession.child_id == child_id).all()

@app.post("/profiles/{child_id}/books/{book_id}/sessions")
def save_reading_session(
    child_id: int, 
    book_id: int, 
    session_data: schemas.SessionCreate, 
    db: Session = Depends(get_db)
):
    new_session = models.ReadingSession(
        child_id=child_id,
        book_id=book_id,
        missed_words=session_data.missed_words,
        total_words=session_data.total_words
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return {"message": "Session recorded successfully"}