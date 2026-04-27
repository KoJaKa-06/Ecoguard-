"""EcoGuard - Environmental Reporting System API"""
import os
import random
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import bcrypt
from jose import jwt
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session, selectinload

from models import (
    get_db, init_db, Report, ReportImage, ReportNote, StatusHistory,
    AuthorityOfficer, PublicNotice,
    VerificationStatus, ResolutionStatus, UrgencyLevel, Category,
    IFRANE_LOCATIONS, LOCATION_COORDS
)

app = FastAPI(title="EcoGuard API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

SECRET_KEY = "ecoguard-demo-secret-key-change-in-production"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


# ─── Schemas ───

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    officer_name: str

class ImageOut(BaseModel):
    id: int
    file_path: str
    caption: Optional[str] = None
    is_primary: bool
    uploaded_at: datetime
    class Config:
        from_attributes = True

class NoteOut(BaseModel):
    id: int
    note_type: str
    content: str
    author_name: Optional[str] = None
    created_at: datetime

class HistoryOut(BaseModel):
    id: int
    field_changed: str
    old_value: Optional[str] = None
    new_value: str
    officer_name: Optional[str] = None
    changed_at: datetime

class ReportOut(BaseModel):
    id: int
    reference: str
    category: str
    location: str
    description: str
    road_details: Optional[str] = None
    verification: str
    resolution: str
    urgency: Optional[str] = None
    is_public: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    images: list[ImageOut] = []
    public_notes: list[NoteOut] = []
    class Config:
        from_attributes = True

class ReportDetailOut(ReportOut):
    cin: str
    internal_notes: list[NoteOut] = []
    history: list[HistoryOut] = []

class ReportUpdateRequest(BaseModel):
    verification: Optional[str] = None
    resolution: Optional[str] = None
    urgency: Optional[str] = None
    is_public: Optional[bool] = None

class AddNoteRequest(BaseModel):
    note_type: str  # 'public' or 'internal'
    content: str

class PublicReportLookup(BaseModel):
    reference: str
    category: str
    location: str
    verification: str
    resolution: str
    urgency: Optional[str] = None
    is_public: bool
    public_notes: list[NoteOut] = []
    created_at: datetime

class NoticeOut(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True


# ─── Helpers ───

def report_to_out(r: Report) -> dict:
    """Convert report + relationships to output dict."""
    public_notes = [
        NoteOut(id=n.id, note_type=n.note_type, content=n.content,
                author_name=n.author.name if n.author else None, created_at=n.created_at)
        for n in r.notes if n.note_type == "public"
    ]
    return {
        **{c.name: getattr(r, c.name) for c in r.__table__.columns},
        "images": r.images,
        "public_notes": public_notes,
    }

def report_to_detail(r: Report) -> dict:
    """Convert report + relationships to detail output dict."""
    public_notes = []
    internal_notes = []
    for n in r.notes:
        note = NoteOut(id=n.id, note_type=n.note_type, content=n.content,
                       author_name=n.author.name if n.author else None, created_at=n.created_at)
        if n.note_type == "public":
            public_notes.append(note)
        else:
            internal_notes.append(note)
    history = [
        HistoryOut(id=h.id, field_changed=h.field_changed, old_value=h.old_value,
                   new_value=h.new_value, officer_name=h.officer.name if h.officer else None,
                   changed_at=h.changed_at)
        for h in r.history
    ]
    return {
        **{c.name: getattr(r, c.name) for c in r.__table__.columns},
        "images": r.images,
        "public_notes": public_notes,
        "internal_notes": internal_notes,
        "history": history,
    }


def create_token(officer_id: int) -> str:
    expire = datetime.utcnow() + timedelta(hours=8)
    return jwt.encode({"sub": str(officer_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_officer(token: str, db: Session):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        officer_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    officer = db.query(AuthorityOfficer).filter(AuthorityOfficer.id == officer_id).first()
    if not officer:
        raise HTTPException(status_code=401, detail="Officer not found")
    return officer


def auth_required(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    return get_current_officer(token, db)


async def save_upload(file: UploadFile) -> str:
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG images are accepted")
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")
    ext = "jpg" if "jpeg" in file.content_type else "png"
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{random.randint(1000,9999)}.{ext}"
    filepath = os.path.join("uploads", filename)
    with open(filepath, "wb") as f:
        f.write(content)
    return f"/uploads/{filename}"


# ─── Startup ───

@app.on_event("startup")
def startup():
    init_db()
    db = next(get_db())
    if db.query(Report).count() == 0:
        db.close()
        from seed_data import seed
        seed()
    else:
        db.close()


# ─── Public endpoints ───

@app.get("/api/config")
def get_config():
    return {
        "categories": [c.value for c in Category],
        "locations": IFRANE_LOCATIONS,
        "verification_statuses": [v.value for v in VerificationStatus],
        "resolution_statuses": [r.value for r in ResolutionStatus],
        "urgency_levels": [u.value for u in UrgencyLevel],
    }


@app.get("/api/reports/public")
def get_public_reports(
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    resolution: Optional[str] = None,
    location: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Report).options(
        selectinload(Report.images),
        selectinload(Report.notes).selectinload(ReportNote.author),
    ).filter(
        Report.is_public == True,
        Report.verification == VerificationStatus.APPROVED.value,
    )
    if category:
        query = query.filter(Report.category == category)
    if urgency:
        query = query.filter(Report.urgency == urgency)
    if resolution:
        query = query.filter(Report.resolution == resolution)
    if location:
        query = query.filter(Report.location == location)

    urgency_order = {u.value: i for i, u in enumerate(UrgencyLevel)}
    reports = query.order_by(desc(Report.created_at)).all()
    reports.sort(key=lambda r: (urgency_order.get(r.urgency, 99), -r.created_at.timestamp()))
    return [report_to_out(r) for r in reports]


@app.get("/api/notices", response_model=list[NoticeOut])
def get_notices(db: Session = Depends(get_db)):
    return db.query(PublicNotice).order_by(desc(PublicNotice.created_at)).limit(10).all()


@app.post("/api/reports/submit")
async def submit_report(
    cin: str = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    road_details: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    images: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
):
    valid_categories = [c.value for c in Category]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category")
    if location not in IFRANE_LOCATIONS:
        raise HTTPException(status_code=400, detail=f"Invalid location")
    if not cin or not description:
        raise HTTPException(status_code=400, detail="CIN and description are required")
    if category == "Snow Closure" and not road_details:
        raise HTTPException(status_code=400, detail="Road details required for snow closure")
    if len(images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images allowed")

    last = db.query(Report).order_by(desc(Report.id)).first()
    next_num = (last.id + 1) if last else 1
    reference = f"ECO-{1000 + next_num}"

    coords = (latitude, longitude) if latitude and longitude else LOCATION_COORDS.get(location, (33.5333, -5.1167))

    report = Report(
        reference=reference, cin=cin, category=category, location=location,
        description=description, road_details=road_details,
        verification=VerificationStatus.PENDING.value,
        resolution=ResolutionStatus.ONGOING.value,
        urgency=None, is_public=False,
        latitude=coords[0], longitude=coords[1],
    )
    db.add(report)
    db.flush()

    for i, img in enumerate(images):
        if img.filename:
            path = await save_upload(img)
            db.add(ReportImage(report_id=report.id, file_path=path, is_primary=(i == 0)))

    db.commit()
    db.refresh(report)
    return {"reference": report.reference, "message": "Report submitted successfully"}


@app.get("/api/reports/lookup")
def lookup_report(cin: str = Query(...), reference: str = Query(...), db: Session = Depends(get_db)):
    report = db.query(Report).options(
        selectinload(Report.notes).selectinload(ReportNote.author),
    ).filter(Report.cin == cin, Report.reference == reference).first()
    if not report:
        raise HTTPException(status_code=404, detail="No matching report found")
    public_notes = [
        NoteOut(id=n.id, note_type=n.note_type, content=n.content,
                author_name=n.author.name if n.author else None, created_at=n.created_at)
        for n in report.notes if n.note_type == "public"
    ]
    return PublicReportLookup(
        reference=report.reference, category=report.category, location=report.location,
        verification=report.verification, resolution=report.resolution,
        urgency=report.urgency, is_public=report.is_public,
        public_notes=public_notes, created_at=report.created_at,
    )


# ─── Authority endpoints ───

@app.post("/api/auth/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    officer = db.query(AuthorityOfficer).filter(AuthorityOfficer.email == req.email).first()
    if not officer or not verify_password(req.password, officer.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return LoginResponse(access_token=create_token(officer.id), officer_name=officer.name)


@app.get("/api/authority/reports")
def get_all_reports(
    category: Optional[str] = None,
    verification: Optional[str] = None,
    resolution: Optional[str] = None,
    urgency: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    officer=Depends(auth_required),
    db: Session = Depends(get_db),
):
    query = db.query(Report).options(
        selectinload(Report.images),
        selectinload(Report.notes).selectinload(ReportNote.author),
    )
    if category:
        query = query.filter(Report.category == category)
    if verification:
        query = query.filter(Report.verification == verification)
    if resolution:
        query = query.filter(Report.resolution == resolution)
    if urgency:
        query = query.filter(Report.urgency == urgency)
    if location:
        query = query.filter(Report.location == location)
    if search:
        query = query.filter(
            (Report.reference.contains(search)) | (Report.location.contains(search))
        )

    urgency_order = {u.value: i for i, u in enumerate(UrgencyLevel)}
    reports = query.order_by(desc(Report.created_at)).all()
    reports.sort(key=lambda r: (urgency_order.get(r.urgency, 99), -r.created_at.timestamp()))
    return [report_to_detail(r) for r in reports]


@app.get("/api/authority/reports/{report_id}")
def get_report_detail(report_id: int, officer=Depends(auth_required), db: Session = Depends(get_db)):
    report = db.query(Report).options(
        selectinload(Report.images),
        selectinload(Report.notes).selectinload(ReportNote.author),
        selectinload(Report.history).selectinload(StatusHistory.officer),
    ).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report_to_detail(report)


@app.patch("/api/authority/reports/{report_id}")
def update_report(
    report_id: int,
    update: ReportUpdateRequest,
    officer=Depends(auth_required),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    def log_change(field, old, new):
        db.add(StatusHistory(
            report_id=report.id, officer_id=officer.id,
            field_changed=field, old_value=old, new_value=new,
        ))

    if update.verification is not None and update.verification != report.verification:
        valid = [v.value for v in VerificationStatus]
        if update.verification not in valid:
            raise HTTPException(status_code=400, detail=f"Invalid verification")
        log_change("verification", report.verification, update.verification)
        report.verification = update.verification
        if update.verification in [VerificationStatus.REJECTED.value, VerificationStatus.PENDING.value]:
            report.is_public = False

    if update.resolution is not None and update.resolution != report.resolution:
        valid = [r.value for r in ResolutionStatus]
        if update.resolution not in valid:
            raise HTTPException(status_code=400, detail=f"Invalid resolution")
        verification = update.verification or report.verification
        if verification != VerificationStatus.APPROVED.value:
            raise HTTPException(status_code=400, detail="Only approved reports can change resolution")
        log_change("resolution", report.resolution, update.resolution)
        report.resolution = update.resolution

    if update.urgency is not None and update.urgency != report.urgency:
        valid = [u.value for u in UrgencyLevel]
        if update.urgency not in valid:
            raise HTTPException(status_code=400, detail=f"Invalid urgency")
        log_change("urgency", report.urgency, update.urgency)
        report.urgency = update.urgency

    if update.is_public is not None:
        if report.verification != VerificationStatus.APPROVED.value:
            raise HTTPException(status_code=400, detail="Only approved reports can be public")
        report.is_public = update.is_public

    report.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Report updated successfully"}


@app.post("/api/authority/reports/{report_id}/notes")
def add_note(report_id: int, req: AddNoteRequest, officer=Depends(auth_required), db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if req.note_type not in ("public", "internal"):
        raise HTTPException(status_code=400, detail="note_type must be 'public' or 'internal'")
    note = ReportNote(
        report_id=report.id, author_id=officer.id,
        note_type=req.note_type, content=req.content,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": note.id, "message": "Note added"}


@app.post("/api/authority/reports/{report_id}/images")
async def add_images(
    report_id: int,
    images: list[UploadFile] = File(...),
    officer=Depends(auth_required),
    db: Session = Depends(get_db),
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    existing = db.query(ReportImage).filter(ReportImage.report_id == report_id).count()
    if existing + len(images) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images per report")
    for img in images:
        if img.filename:
            path = await save_upload(img)
            db.add(ReportImage(report_id=report.id, file_path=path, is_primary=(existing == 0)))
            existing += 1
    db.commit()
    return {"message": f"{len(images)} image(s) added"}


@app.get("/api/authority/stats")
def get_stats(officer=Depends(auth_required), db: Session = Depends(get_db)):
    total = db.query(Report).count()
    pending = db.query(Report).filter(Report.verification == VerificationStatus.PENDING.value).count()
    approved = db.query(Report).filter(Report.verification == VerificationStatus.APPROVED.value).count()
    rejected = db.query(Report).filter(Report.verification == VerificationStatus.REJECTED.value).count()
    ongoing = db.query(Report).filter(
        Report.verification == VerificationStatus.APPROVED.value,
        Report.resolution == ResolutionStatus.ONGOING.value,
    ).count()
    in_progress = db.query(Report).filter(
        Report.verification == VerificationStatus.APPROVED.value,
        Report.resolution == ResolutionStatus.IN_PROGRESS.value,
    ).count()
    resolved = db.query(Report).filter(
        Report.verification == VerificationStatus.APPROVED.value,
        Report.resolution == ResolutionStatus.RESOLVED.value,
    ).count()
    return {
        "total": total, "pending": pending, "approved": approved, "rejected": rejected,
        "ongoing": ongoing, "in_progress": in_progress, "resolved": resolved,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
