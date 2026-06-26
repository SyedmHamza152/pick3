from app.database import SessionLocal
from app.models import User
from app.security import hash_password

db = SessionLocal()
try:
    # Test the user exists
    email = "talha@gmail.com"
    username = "talha"
    
    user = db.query(User).filter(
        User.email == email,
        User.username == username
    ).first()
    
    if user:
        print(f"✓ User found: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Security Question: {user.security_question}")
        print(f"  Security Answer: {user.security_answer}")
        
        # Test security answer verification
        test_answer = "black"
        if user.security_answer.lower() == test_answer.lower():
            print(f"✓ Security answer verification works: '{test_answer}' matches")
        else:
            print(f"✗ Security answer verification failed: '{test_answer}' does not match")
            
        # Test password reset
        new_password = "newtest123"
        user.password = hash_password(new_password)
        db.commit()
        print(f"✓ Password reset successful")
        
        # Verify password was changed
        db.refresh(user)
        print(f"  New password hash: {user.password[:50]}...")
        
    else:
        print("✗ User not found")
        
finally:
    db.close()
