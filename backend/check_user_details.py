from app.database import engine
from sqlalchemy import text

with engine.connect() as connection:
    result = connection.execute(text('SELECT username, email, security_question, security_answer FROM users WHERE username = :username'), {'username': 'talha'})
    for row in result:
        print(f"Username: {row[0]}")
        print(f"Email: {row[1]}")
        print(f"Security Question: {row[2]}")
        print(f"Security Answer: {row[3]}")
