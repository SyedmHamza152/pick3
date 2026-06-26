from app.database import SessionLocal
from app.models import User

db = SessionLocal()
try:
    # Test the exact query used in the forgot password endpoint
    email = "talha@gmail.com"
    username = "talha"
    
    user = db.query(User).filter(
        User.email == email,
        User.username == username
    ).first()
    
    if user:
        print(f"User found: {user.username}, email: {user.email}")
        print(f"Security question: {user.security_question}")
        print(f"Security answer: {user.security_answer}")
    else:
        print("User NOT found")
        
        # Debug: check all users
        print("\nAll users in database:")
        all_users = db.query(User).all()
        for u in all_users:
            print(f"  Username: '{u.username}', Email: '{u.email}'")
            
        # Debug: check individual conditions
        print(f"\nChecking email '{email}':")
        email_match = db.query(User).filter(User.email == email).first()
        print(f"  Email match: {email_match.username if email_match else 'None'}")
        
        print(f"\nChecking username '{username}':")
        username_match = db.query(User).filter(User.username == username).first()
        print(f"  Username match: {username_match.username if username_match else 'None'}")
        
        if email_match and username_match:
            print(f"\nBoth exist separately but not together!")
            print(f"  Email user: {email_match.username}")
            print(f"  Username user: {username_match.username}")
            
finally:
    db.close()
