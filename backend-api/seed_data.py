"""Seed the database with demo data."""
from datetime import datetime, timedelta
import bcrypt
from models import (
    SessionLocal, Report, ReportImage, ReportNote, StatusHistory,
    AuthorityOfficer, PublicNotice,
    VerificationStatus, ResolutionStatus, UrgencyLevel, LOCATION_COORDS, init_db
)


def seed():
    init_db()
    db = SessionLocal()

    # Clear in correct order (foreign keys)
    db.query(StatusHistory).delete()
    db.query(ReportNote).delete()
    db.query(ReportImage).delete()
    db.query(Report).delete()
    db.query(AuthorityOfficer).delete()
    db.query(PublicNotice).delete()
    db.commit()

    officer = AuthorityOfficer(
        email="authority@ifrane.ma",
        hashed_password=bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode(),
        name="Officer Ahmed",
        role="officer",
    )
    db.add(officer)
    db.flush()

    officer2 = AuthorityOfficer(
        email="b.fatouh@aui.ma",
        hashed_password=bcrypt.hashpw(b"badr2006", bcrypt.gensalt()).decode(),
        name="badr",
        role="officer",
    )
    db.add(officer2)
    db.flush()

    now = datetime.utcnow()
    reports_data = [
        dict(reference="ECO-1001", cin="A123456", category="Wildfire", location="Ain Vittel",
             description="Smoke was reported coming from the forest near the spring. Local residents reported visible flames on the hillside and poor air quality in the immediate area.",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.IN_PROGRESS.value,
             urgency=UrgencyLevel.HIGH.value, is_public=True,
             latitude=LOCATION_COORDS["Ain Vittel"][0], longitude=LOCATION_COORDS["Ain Vittel"][1],
             created_at=now - timedelta(days=1)),
        dict(reference="ECO-1002", cin="B789012", category="Illegal Dumping", location="Azrou Road",
             description="Construction waste and household trash dumped along the roadside near the Azrou junction.",
             verification=VerificationStatus.PENDING.value, resolution=ResolutionStatus.ONGOING.value,
             urgency=None, is_public=False,
             latitude=LOCATION_COORDS["Azrou Road"][0], longitude=LOCATION_COORDS["Azrou Road"][1],
             created_at=now - timedelta(hours=12)),
        dict(reference="ECO-1003", cin="C345678", category="Snow Closure", location="Ifrane City Center",
             description="Heavy snowfall is blocking the main intersection, causing vehicles to queue.",
             road_details="Intersection of Hassan II and Mohammed V",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.RESOLVED.value,
             urgency=UrgencyLevel.MEDIUM.value, is_public=True,
             latitude=LOCATION_COORDS["Ifrane City Center"][0], longitude=LOCATION_COORDS["Ifrane City Center"][1],
             created_at=now - timedelta(days=3)),
        dict(reference="ECO-1004", cin="D901234", category="Pollution", location="Dayet Aoua",
             description="Unusual discoloration observed in the lake water near the eastern shore. Strong chemical odor reported by hikers.",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.ONGOING.value,
             urgency=UrgencyLevel.LOW.value, is_public=True,
             latitude=LOCATION_COORDS["Dayet Aoua"][0], longitude=LOCATION_COORDS["Dayet Aoua"][1],
             created_at=now - timedelta(days=4)),
        dict(reference="ECO-1005", cin="E567890", category="Wildfire", location="Ifrane National Park",
             description="Campfire left unattended near hiking trail. Surrounding dry brush showing scorch marks.",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.IN_PROGRESS.value,
             urgency=UrgencyLevel.CRITICAL.value, is_public=True,
             latitude=LOCATION_COORDS["Ifrane National Park"][0], longitude=LOCATION_COORDS["Ifrane National Park"][1],
             created_at=now - timedelta(hours=6)),
        dict(reference="ECO-1006", cin="F112233", category="Water Contamination", location="Ben Smim",
             description="Well water has turned murky and has an unusual taste. Several households affected.",
             verification=VerificationStatus.PENDING.value, resolution=ResolutionStatus.ONGOING.value,
             urgency=None, is_public=False,
             latitude=LOCATION_COORDS["Ben Smim"][0], longitude=LOCATION_COORDS["Ben Smim"][1],
             created_at=now - timedelta(hours=3)),
        dict(reference="ECO-1007", cin="G445566", category="Deforestation", location="Val d'Ifrane",
             description="Several cedar trees appear to have been cut down near the valley entrance.",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.IN_PROGRESS.value,
             urgency=UrgencyLevel.HIGH.value, is_public=True,
             latitude=LOCATION_COORDS["Val d'Ifrane"][0], longitude=LOCATION_COORDS["Val d'Ifrane"][1],
             created_at=now - timedelta(days=2)),
        dict(reference="ECO-1008", cin="H778899", category="Snow Closure", location="Michlifen",
             description="Road to Michlifen ski resort completely blocked by avalanche debris.",
             road_details="Route Michlifen km 12-14",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.ONGOING.value,
             urgency=UrgencyLevel.HIGH.value, is_public=True,
             latitude=LOCATION_COORDS["Michlifen"][0], longitude=LOCATION_COORDS["Michlifen"][1],
             created_at=now - timedelta(days=1, hours=6)),
        dict(reference="ECO-1009", cin="I990011", category="Pollution", location="Tizguit",
             description="Black smoke emitting from an unlicensed workshop.",
             verification=VerificationStatus.REJECTED.value, resolution=ResolutionStatus.ONGOING.value,
             urgency=UrgencyLevel.LOW.value, is_public=False,
             latitude=LOCATION_COORDS["Tizguit"][0], longitude=LOCATION_COORDS["Tizguit"][1],
             created_at=now - timedelta(days=5)),
        dict(reference="ECO-1010", cin="J223344", category="Illegal Dumping", location="Zaouia d'Ifrane",
             description="Agricultural waste being dumped into the irrigation canal.",
             verification=VerificationStatus.APPROVED.value, resolution=ResolutionStatus.RESOLVED.value,
             urgency=UrgencyLevel.MEDIUM.value, is_public=True,
             latitude=LOCATION_COORDS["Zaouia d'Ifrane"][0], longitude=LOCATION_COORDS["Zaouia d'Ifrane"][1],
             created_at=now - timedelta(days=1, hours=18)),
    ]

    reports = []
    for d in reports_data:
        r = Report(**d)
        db.add(r)
        db.flush()
        reports.append(r)

    # Add notes
    notes_data = [
        (0, "public", "Fire contained, monitoring continues. Residents should avoid the forest perimeter."),
        (0, "internal", "Dispatched field team at 14:00. Monitor thermal hotspot reports overnight."),
        (0, "public", "Aerial survey completed. No active flames detected. Perimeter reduced."),
        (2, "public", "Snow cleared. Roads reopened. Drive carefully."),
        (2, "internal", "Snow removal crew completed work at 16:00."),
        (3, "public", "Water samples collected. Preliminary results: seasonal algae bloom."),
        (3, "internal", "Lab results pending. Follow up in 48 hours."),
        (4, "public", "Park rangers on site. Trail temporarily closed."),
        (4, "internal", "Request aerial survey if wind picks up. Contact forestry department."),
        (4, "public", "Containment line established. Fire 60% contained."),
        (6, "public", "Investigation underway. Area cordoned off."),
        (6, "internal", "Forest guard notified. Police report filed."),
        (7, "public", "Road closed until further notice. Heavy machinery deployed."),
        (7, "internal", "Estimated clearance: 24-48 hours. Coordinate with tourism office."),
        (8, "internal", "Duplicate report. Already addressed under ECO-0987."),
        (9, "public", "Cleanup completed. Canal restored to normal flow."),
        (9, "internal", "Source farm identified. Environmental police notified."),
        (9, "public", "Follow-up inspection confirmed area is clean."),
    ]
    for idx, ntype, content in notes_data:
        db.add(ReportNote(
            report_id=reports[idx].id, author_id=officer.id,
            note_type=ntype, content=content,
            created_at=reports[idx].created_at + timedelta(hours=2 + notes_data.index((idx, ntype, content))),
        ))

    # Add status history for approved reports
    for i, r in enumerate(reports):
        if r.verification == VerificationStatus.APPROVED.value:
            db.add(StatusHistory(
                report_id=r.id, officer_id=officer.id,
                field_changed="verification", old_value="Pending", new_value="Approved",
                changed_at=r.created_at + timedelta(hours=1),
            ))
            if r.resolution != ResolutionStatus.ONGOING.value:
                db.add(StatusHistory(
                    report_id=r.id, officer_id=officer.id,
                    field_changed="resolution", old_value="Ongoing", new_value=r.resolution,
                    changed_at=r.created_at + timedelta(hours=3),
                ))
            if r.urgency:
                db.add(StatusHistory(
                    report_id=r.id, officer_id=officer.id,
                    field_changed="urgency", old_value=None, new_value=r.urgency,
                    changed_at=r.created_at + timedelta(hours=1),
                ))
        elif r.verification == VerificationStatus.REJECTED.value:
            db.add(StatusHistory(
                report_id=r.id, officer_id=officer.id,
                field_changed="verification", old_value="Pending", new_value="Rejected",
                changed_at=r.created_at + timedelta(hours=2),
            ))

    notices = [
        PublicNotice(title="Wildfire near Ain Vittel", content="Fire contained. Monitoring continues.", created_at=now - timedelta(days=1)),
        PublicNotice(title="Snow Closure Update - Michlifen Road", content="Road to Michlifen remains closed. Use alternate route via Azrou.", created_at=now - timedelta(hours=12)),
        PublicNotice(title="Weekly Environmental Summary", content="10 new reports received this week. 3 resolved, 5 in progress.", created_at=now - timedelta(hours=6)),
    ]
    db.add_all(notices)
    db.commit()
    db.close()
    print("Database seeded successfully with demo data!")


if __name__ == "__main__":
    seed()
