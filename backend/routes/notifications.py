from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_training_db
from models import User, CropLog, Notification
from schemas import NotificationResponse, NotificationUpdate
from auth import get_current_user
from services.weather_service import weather_service
from typing import List
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Get notifications for the authenticated user (latest first)"""
    query = db.query(Notification)\
        .filter(Notification.user_email == current_user.email)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query\
        .order_by(Notification.created_at.desc())\
        .limit(limit)\
        .all()
    
    return notifications


@router.patch("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: int,
    notification_update: NotificationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Mark a notification as read/unread"""
    notification = db.query(Notification)\
        .filter(
            Notification.id == notification_id,
            Notification.user_email == current_user.email
        ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = notification_update.is_read
    
    try:
        db.commit()
        db.refresh(notification)
        return notification
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating notification: {str(e)}"
        )


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Delete a specific notification"""
    notification = db.query(Notification)\
        .filter(
            Notification.id == notification_id,
            Notification.user_email == current_user.email
        ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    try:
        db.delete(notification)
        db.commit()
        return {"message": "Notification deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting notification: {str(e)}"
        )


async def generate_notifications_for_user(user_email: str, db: Session):
    
    notifications_created = 0
    
    # Get all crop logs for the user
    crops = db.query(CropLog)\
        .filter(CropLog.user_email == user_email)\
        .all()
    
    if not crops:
        return 0
    
    for crop in crops:
        try:
            # Fetch weather data
            weather = None
            if crop.latitude and crop.longitude:
                weather = await weather_service.get_weather_by_coords(crop.latitude, crop.longitude)
            else:
                weather = await weather_service.get_weather_by_location(crop.location)
            
            if not weather:
                print(f"Could not fetch weather for crop {crop.id}")
                continue
            
            # Generate suggestion
            message, notification_type = weather_service.generate_crop_suggestion(
                crop.crop_name,
                weather,
                crop.growth_stage
            )
            
            # Check if we already have a similar recent notification (within last 6 hours)
            recent_cutoff = datetime.utcnow() - timedelta(hours=6)
            existing_notification = db.query(Notification)\
                .filter(
                    and_(
                        Notification.crop_id == crop.id,
                        Notification.message == message,
                        Notification.created_at >= recent_cutoff
                    )
                ).first()
            
            # Only create notification if it's new or conditions changed
            if not existing_notification:
                notification = Notification(
                    crop_id=crop.id,
                    user_email=user_email,
                    crop_name=crop.crop_name,
                    message=message,
                    notification_type=notification_type,
                    weather_condition=weather.condition,
                    temperature=weather.temperature,
                    humidity=weather.humidity,
                    is_read=False
                )
                db.add(notification)
                notifications_created += 1
        
        except Exception as e:
            print(f"Error generating notification for crop {crop.id}: {str(e)}")
            continue
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error committing notifications: {str(e)}")
    
    return notifications_created


@router.post("/generate")
async def generate_notifications(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """
    Generate weather-based notifications for all user's crop logs
    This endpoint can be called manually or scheduled as a cron job
    """
    try:
        # Run synchronously for immediate response
        notifications_created = await generate_notifications_for_user(current_user.email, db)
        
        return {
            "message": f"Successfully generated {notifications_created} notification(s)",
            "notifications_created": notifications_created,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating notifications: {str(e)}"
        )


@router.post("/generate-all")
async def generate_all_notifications(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_training_db)
):
    """
    Generate notifications for ALL users (admin/cron job endpoint)
    This should be called periodically (e.g., every 6 hours)
    """
    try:
        # Get all unique user emails who have crop logs
        user_emails = db.query(CropLog.user_email).distinct().all()
        user_emails = [email[0] for email in user_emails]
        
        total_notifications = 0
        for user_email in user_emails:
            try:
                notifications_created = await generate_notifications_for_user(user_email, db)
                total_notifications += notifications_created
            except Exception as e:
                print(f"Error generating notifications for {user_email}: {str(e)}")
                continue
        
        return {
            "message": f"Successfully generated notifications for {len(user_emails)} users",
            "total_notifications": total_notifications,
            "users_processed": len(user_emails),
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating notifications for all users: {str(e)}"
        )


@router.get("/stats")
async def get_notification_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Get notification statistics for the user"""
    total = db.query(Notification)\
        .filter(Notification.user_email == current_user.email)\
        .count()
    
    unread = db.query(Notification)\
        .filter(
            Notification.user_email == current_user.email,
            Notification.is_read == False
        ).count()
    
    by_type = {}
    for notif_type in ["info", "warning", "alert"]:
        count = db.query(Notification)\
            .filter(
                Notification.user_email == current_user.email,
                Notification.notification_type == notif_type
            ).count()
        by_type[notif_type] = count
    
    return {
        "total": total,
        "unread": unread,
        "by_type": by_type
    }
