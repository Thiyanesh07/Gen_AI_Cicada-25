from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import settings

# User Database
user_engine = create_engine(settings.USER_DATABASE_URL)
UserSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)
UserBase = declarative_base()

# Training Database
training_engine = create_engine(settings.TRAINING_DATABASE_URL)
TrainingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=training_engine)
TrainingBase = declarative_base()


def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_training_db():
    db = TrainingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_default_data():
    from auth import get_password_hash
    from models import CropLog, Notification, User

    user_db = UserSessionLocal()
    training_db = TrainingSessionLocal()

    try:
        user_email = "farmer@example.com"
        default_password = "farmer123"

        existing_user = user_db.query(User).filter(User.email == user_email).first()
        if not existing_user:
            user_db.add(User(
                email=user_email,
                hashed_password=get_password_hash(default_password),
                created_at=datetime.utcnow()
            ))
            user_db.commit()

        if training_db.query(CropLog).filter(CropLog.user_email == user_email).count() == 0:
            now = datetime.utcnow()
            crop_records = [
                {
                    "id": 1,
                    "user_email": user_email,
                    "crop_name": "Corn",
                    "location": "Salem, Tamil Nadu",
                    "latitude": 11.6643,
                    "longitude": 78.146,
                    "date_planted": (now.date() - timedelta(days=35)),
                    "growth_stage": "vegetative",
                    "notes": "Maintain irrigation schedule and verify root zone moisture during active vegetative growth.",
                    "created_at": now - timedelta(days=35),
                    "updated_at": now - timedelta(days=29),
                },
                {
                    "user_email": user_email,
                    "crop_name": "Tomato",
                    "location": "Coimbatore, Tamil Nadu",
                    "latitude": 11.0168,
                    "longitude": 76.9558,
                    "date_planted": (now.date() - timedelta(days=28)),
                    "growth_stage": "flowering",
                    "notes": "Monitor fruit load and prevent fungal pressure during warm, humid evenings.",
                    "created_at": now - timedelta(days=28),
                    "updated_at": now - timedelta(days=19),
                },
                {
                    "user_email": user_email,
                    "crop_name": "Rice",
                    "location": "Thanjavur, Tamil Nadu",
                    "latitude": 10.7870,
                    "longitude": 79.1378,
                    "date_planted": (now.date() - timedelta(days=52)),
                    "growth_stage": "tillering",
                    "notes": "Maintain standing water depth and apply split nitrogen doses across the field.",
                    "created_at": now - timedelta(days=52),
                    "updated_at": now - timedelta(days=11),
                },
                {
                    "user_email": user_email,
                    "crop_name": "Sugarcane",
                    "location": "Erode, Tamil Nadu",
                    "latitude": 11.3410,
                    "longitude": 77.7172,
                    "date_planted": (now.date() - timedelta(days=90)),
                    "growth_stage": "grand growth",
                    "notes": "Inspect exposure zones for lodging risk and confirm nutrient placement in ratoon blocks.",
                    "created_at": now - timedelta(days=90),
                    "updated_at": now - timedelta(days=12),
                },
                {
                    "user_email": user_email,
                    "crop_name": "Banana",
                    "location": "Trichy, Tamil Nadu",
                    "latitude": 10.7905,
                    "longitude": 78.7047,
                    "date_planted": (now.date() - timedelta(days=110)),
                    "growth_stage": "fruit development",
                    "notes": "Increase potassium and inspect bunch covers to reduce quality issues before harvest.",
                    "created_at": now - timedelta(days=110),
                    "updated_at": now - timedelta(days=15),
                },
            ]

            for crop in crop_records:
                training_db.add(CropLog(**crop))
            training_db.commit()

        if training_db.query(Notification).filter(Notification.user_email == user_email).count() == 0:
            crops = training_db.query(CropLog).filter(CropLog.user_email == user_email).all()
            base_time = datetime.utcnow()
            notification_templates = [
                (
                    "Irrigation cycle is due in the next 4 hours. Soil moisture has fallen below the target range for the current growth stage.",
                    "warning",
                    "Sunny",
                    34,
                    41,
                    0,
                ),
                (
                    "Humidity trend indicates a fungal risk window. Increase airflow and reduce nighttime leaf wetness.",
                    "alert",
                    "Cloudy",
                    29,
                    78,
                    90,
                ),
                (
                    "Nitrogen demand is elevated during tillering. Apply a split dose based on field health review.",
                    "info",
                    "Humid",
                    30,
                    70,
                    180,
                ),
                (
                    "Wind advisory detected. Secure exposed rows and inspect for lodging risk in the ratoon field.",
                    "warning",
                    "Windy",
                    31,
                    46,
                    300,
                ),
                (
                    "Leaf health is declining in one block. Check potassium availability and irrigation uniformity.",
                    "info",
                    "Partly Cloudy",
                    28,
                    62,
                    480,
                ),
            ]

            for crop, (message, notification_type, weather_condition, temperature, humidity, minutes_ago) in zip(crops, notification_templates):
                training_db.add(Notification(
                    crop_id=crop.id,
                    user_email=user_email,
                    crop_name=crop.crop_name,
                    message=message,
                    notification_type=notification_type,
                    weather_condition=weather_condition,
                    temperature=temperature,
                    humidity=humidity,
                    is_read=False,
                    created_at=base_time - timedelta(minutes=minutes_ago),
                ))
            training_db.commit()
    finally:
        user_db.close()
        training_db.close()


def init_db():
    UserBase.metadata.create_all(bind=user_engine)
    TrainingBase.metadata.create_all(bind=training_engine)
    seed_default_data()
