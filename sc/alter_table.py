import sys
import os

try:
    import psycopg2
    print("psycopg2 is installed")
except ImportError:
    print("psycopg2 is not installed, trying to install it...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2
    print("psycopg2-binary installed successfully")

def main():
    db_pass = "iGz3mNk9mg-E5st"
    db_host = "db.zykszjkgjmflojxgmrcn.supabase.co"
    db_port = "5432"
    db_user = "postgres"
    db_name = "postgres"

    conn_str = f"dbname={db_name} user={db_user} password={db_pass} host={db_host} port={db_port}"
    print(f"Connecting to database at {db_host}...")
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        print("Connected! Checking if education_level column exists...")
        
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='students' AND column_name='education_level';
        """)
        row = cur.fetchone()
        if row:
            print("Column education_level already exists.")
        else:
            print("Column education_level does not exist. Adding it...")
            cur.execute("ALTER TABLE students ADD COLUMN education_level TEXT;")
            conn.commit()
            print("Column education_level added successfully!")
            
        cur.close()
        conn.close()
    except Exception as e:
        print("Error occurred:", e)

if __name__ == "__main__":
    main()
