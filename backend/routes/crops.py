from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from database import get_training_db
from models import User, CropLog
from schemas import CropLogCreate, CropLogUpdate, CropLogResponse
from auth import get_current_user
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/crops", tags=["Crops"])


@router.post("/", response_model=CropLogResponse, status_code=status.HTTP_201_CREATED)
async def create_crop_log(
    crop_data: CropLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Create a new crop log for the authenticated user"""
    try:
        
        valid_stages = ["seedling", "vegetative", "flowering", "harvest"]
        if crop_data.growth_stage.lower() not in valid_stages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid growth_stage. Must be one of: {', '.join(valid_stages)}"
            )
        
        crop_log = CropLog(
            user_email=current_user.email,
            crop_name=crop_data.crop_name,
            location=crop_data.location,
            latitude=crop_data.latitude,
            longitude=crop_data.longitude,
            date_planted=crop_data.date_planted,
            growth_stage=crop_data.growth_stage.lower(),
            notes=crop_data.notes
        )
        db.add(crop_log)
        db.commit()
        db.refresh(crop_log)
        
        return crop_log
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating crop log: {str(e)}"
        )


@router.get("/", response_model=List[CropLogResponse])
async def get_user_crops(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Get all crop logs for the authenticated user"""
    crops = db.query(CropLog)\
        .filter(CropLog.user_email == current_user.email)\
        .order_by(CropLog.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return crops


@router.get("/{crop_id}", response_model=CropLogResponse)
async def get_crop_by_id(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Get a specific crop log by ID"""
    crop = db.query(CropLog)\
        .filter(
            CropLog.id == crop_id,
            CropLog.user_email == current_user.email
        ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop log not found"
        )
    
    return crop


@router.put("/{crop_id}", response_model=CropLogResponse)
async def update_crop_log(
    crop_id: int,
    crop_update: CropLogUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Update a crop log"""
    crop = db.query(CropLog)\
        .filter(
            CropLog.id == crop_id,
            CropLog.user_email == current_user.email
        ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop log not found"
        )
    
    # Validate growth stage if provided
    if crop_update.growth_stage:
        valid_stages = ["seedling", "vegetative", "flowering", "harvest"]
        if crop_update.growth_stage.lower() not in valid_stages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid growth_stage. Must be one of: {', '.join(valid_stages)}"
            )
    
    # Update fields
    update_data = crop_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "growth_stage" and value:
            value = value.lower()
        setattr(crop, field, value)
    
    crop.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(crop)
        return crop
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating crop log: {str(e)}"
        )


@router.delete("/{crop_id}")
async def delete_crop_log(
    crop_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_training_db)
):
    """Delete a crop log and its associated notifications"""
    crop = db.query(CropLog)\
        .filter(
            CropLog.id == crop_id,
            CropLog.user_email == current_user.email
        ).first()
    
    if not crop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Crop log not found"
        )
    
    try:
        # Delete associated notifications first
        from models import Notification
        db.query(Notification).filter(Notification.crop_id == crop_id).delete()
        
        # Delete the crop log
        db.delete(crop)
        db.commit()
        
        return {"message": "Crop log deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting crop log: {str(e)}"
        )
