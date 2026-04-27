from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, create_engine
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import enum
import os

Base = declarative_base()


class VerificationStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ResolutionStatus(str, enum.Enum):
    ONGOING = "Ongoing"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"


class UrgencyLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class Category(str, enum.Enum):
    WILDFIRE = "Wildfire"
    POLLUTION = "Pollution"
    SNOW_CLOSURE = "Snow Closure"
    ILLEGAL_DUMPING = "Illegal Dumping"
    WATER_CONTAMINATION = "Water Contamination"
    DEFORESTATION = "Deforestation"


IFRANE_LOCATIONS = [
    "Ain Vittel", "Ifrane City Center", "Dayet Aoua", "Azrou Road",
    "Val d'Ifrane", "Michlifen", "Ifrane National Park",
    "Zaouia d'Ifrane", "Tizguit", "Ben Smim",
]

LOCATION_COORDS = {
    "Ain Vittel": (33.5228, -5.1100),
    "Ifrane City Center": (33.5333, -5.1167),
    "Dayet Aoua": (33.4700, -5.0700),
    "Azrou Road": (33.4400, -5.2200),
    "Val d'Ifrane": (33.5100, -5.1300),
    "Michlifen": (33.4100, -5.0700),
    "Ifrane National Park": (33.4900, -5.1500),
    "Zaouia d'Ifrane": (33.5400, -5.1250),
    "Tizguit": (33.5500, -5.0900),
    "Ben Smim": (33.4600, -5.1700),
}


# ─── Core tables ───

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reference = Column(String(20), unique=True, nullable=False, index=True)
    cin = Column(String(20), nullable=False)
    category = Column(String(50), nullable=False)
    location = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    road_details = Column(String(200), nullable=True)
    verification = Column(String(20), nullable=False, default=VerificationStatus.PENDING.value)
    resolution = Column(String(20), nullable=False, default=ResolutionStatus.ONGOING.value)
    urgency = Column(String(20), nullable=True)
    is_public = Column(Boolean, default=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    images = relationship("ReportImage", back_populates="report", cascade="all, delete-orphan", order_by="ReportImage.uploaded_at")
    notes = relationship("ReportNote", back_populates="report", cascade="all, delete-orphan", order_by="ReportNote.created_at.desc()")
    history = relationship("StatusHistory", back_populates="report", cascade="all, delete-orphan", order_by="StatusHistory.changed_at.desc()")


class ReportImage(Base):
    __tablename__ = "report_images"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(255), nullable=False)
    caption = Column(String(200), nullable=True)
    is_primary = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="images")


class ReportNote(Base):
    __tablename__ = "report_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    note_type = Column(String(10), nullable=False)  # 'public' or 'internal'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="notes")
    author = relationship("AuthorityOfficer")


class StatusHistory(Base):
    __tablename__ = "status_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    report_id = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"), nullable=False)
    officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    field_changed = Column(String(20), nullable=False)
    old_value = Column(String(50), nullable=True)
    new_value = Column(String(50), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="history")
    officer = relationship("AuthorityOfficer")


class AuthorityOfficer(Base):
    __tablename__ = "officers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), default="officer")


class PublicNotice(Base):
    __tablename__ = "public_notices"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Database setup ───

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres.fbenxxnclsxztfrfpmjs:hassansoftware2006%40@aws-0-eu-west-1.pooler.supabase.com:6543/postgres"
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=5, max_overflow=10)
SessionLocal = sessionmaker(bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
