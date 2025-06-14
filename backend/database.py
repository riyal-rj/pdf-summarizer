import mysql.connector
from mysql.connector import Error
from datetime import datetime
from fastapi import HTTPException
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MySQL configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'database': os.getenv('MYSQL_DB'),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'port': os.getenv('MYSQL_PORT')
}

def get_db_connection():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")
    return None

def init_db():
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                upload_date VARCHAR(50) NOT NULL
            )
        ''')
        conn.commit()
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error initializing database: {str(e)}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def save_document_metadata(filename: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO documents (filename, upload_date) VALUES (%s, %s)",
            (filename, datetime.now().isoformat())
        )
        conn.commit()
        doc_id = cursor.lastrowid
        return doc_id
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error saving document metadata: {str(e)}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_documents():
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, filename, upload_date FROM documents")
        docs = cursor.fetchall()
        return docs
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Error fetching documents: {str(e)}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_document_filename(doc_id: int):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT filename FROM documents WHERE id = %s", (doc_id,))
        result = cursor.fetchone()
        return result[0] if result else None
    except Error as e:
        raise HTTPException(status_code=404, detail=f"Error fetching document filename: {str(e)}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()