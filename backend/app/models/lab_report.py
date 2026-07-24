from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.db.session import Base

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    report_date = Column(Date)
    test_type = Column(String)
    results = Column(JSONB)
