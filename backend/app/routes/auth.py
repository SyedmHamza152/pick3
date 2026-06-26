import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import SignupIn, LoginIn, TokenOut, ForgotPasswordValidateIn, ForgotPasswordResetIn
from ..security import hash_password, verify_password, create_access_token, get_current_user
from ..user_ids import make_public_id

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_out(user: User, token: str = "") -> TokenOut:
    return TokenOut(
        access_token=token,
        user_id=user.user_id,
        public_id=user.public_id,
        username=user.username,
        phone=user.phone,
        is_admin=user.is_admin,
        account_balance=user.account_balance,
    )


@router.post("/signup", response_model=TokenOut, status_code=201)
def signup(data: SignupIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Username already taken")
    if data.phone and db.query(User).filter(User.phone == data.phone).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Phone number already registered")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = User(
        username=data.username,
        password=hash_password(data.password),
        phone=data.phone,
        email=data.email,
        security_question=data.security_question,
        security_answer=data.security_answer,
        public_id=f"TMP{uuid.uuid4().hex[:12]}",
    )
    db.add(user)
    db.flush()
    user.public_id = make_public_id(user.user_id)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.user_id, user.is_admin)
    return _token_out(user, token)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    token = create_access_token(user.user_id, user.is_admin)
    return _token_out(user, token)


@router.get("/me", response_model=TokenOut)
def me(user: User = Depends(get_current_user)):
    return _token_out(user)


@router.post("/forgot-password/validate")
def forgot_password_validate(data: ForgotPasswordValidateIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == data.email,
        User.username == data.username
    ).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found with provided email and username")
    
    # Check if user has security question set (for users created before the feature)
    if not user.security_question or not user.security_answer:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account does not have security questions set up. Please contact support.")
    
    # If security_answer is provided, verify it (second step)
    if data.security_answer:
        if user.security_answer.lower() != data.security_answer.lower():
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect security answer")
        return {"security_question": user.security_question, "valid": True}
    
    # First step: just return the security question
    return {"security_question": user.security_question, "valid": False}


@router.post("/forgot-password/reset")
def forgot_password_reset(data: ForgotPasswordResetIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == data.email,
        User.username == data.username
    ).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found with provided email and username")
    
    # Check if user has security question set (for users created before the feature)
    if not user.security_question or not user.security_answer:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This account does not have security questions set up. Please contact support.")
    
    if user.security_answer.lower() != data.security_answer.lower():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect security answer")
    user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
