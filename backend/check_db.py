import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_user():
    load_dotenv()
    uri = os.getenv("MONGODB_URL", "mongodb://localhost:27017/evalify")
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    
    email = "gowthamreddy1013@gmail.com"
    name = "gowtham1"
    
    print(f"--- RAW DATABASE DIAGNOSTICS ---")
    print(f"Connecting to: {uri.split('@')[-1] if '@' in uri else uri}")
    
    # Check by email
    user_by_email = await db.users.find_one({"email": email})
    if user_by_email:
        print(f"EMAIL [{email}]: FOUND")
        print(f"  - User ID: {user_by_email['_id']}")
        print(f"  - Name: {user_by_email['name']}")
        print(f"  - Provider: {'Google' if user_by_email.get('hashed_password') == '---' else 'Manual'}")
    else:
        print(f"EMAIL [{email}]: NOT FOUND")
        
    # Check by name
    user_by_name = await db.users.find_one({"name": name})
    if user_by_name:
        print(f"\nUSERNAME [{name}]: FOUND")
        print(f"  - User ID: {user_by_name['_id']}")
        print(f"  - Email: {user_by_name['email']}")
    else:
        print(f"\nUSERNAME [{name}]: NOT FOUND")
    print(f"--------------------------------")

if __name__ == "__main__":
    asyncio.run(check_user())
