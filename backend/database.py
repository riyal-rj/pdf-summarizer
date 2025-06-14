import mysql.connector
from mysql.connector import Error
from datetime import datetime


MYSQL_CONFIG={
    'host':'localhost',
    'database':'pdfDB',
    'user':'root', # Replace with your MySQL username
    'password':'mysql' # Replace with your MySQL password
}

def get_db_connection():
    try:
        conn=mysql.connector.connect(**MYSQL_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise
    return None

def init_db():
    conn=get_db_connection()
    try:
        cursor=conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS documents (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                       filename VARCHAR(255) NOT NULL,
                       upload_date VARCHAR(255) NOT NULL
            )
        ''')
        conn.commit()
    except Error as e:
        print(f"Error initailaizing database: {e}")
        raise
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def save_document_metadata(filename:str):
    conn=get_db_connection()
    try:
        cursor=conn.cursor()
        cursor.execute(
            "INSERT INTO documents (filename,upload_date) VALUES (%s,%s)",
            (filename,datetime.now().isoformat())
        )
        conn.commit()
        doc_id=cursor.lastrowid
        return doc_id
    except Error as e:
        print(f"Error saving document metadata: {e}")
        raise
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

def get_documents():
    conn=get_db_connection()
    try:
        cursor=conn.cursor()
        cursor.execute("SELECT * FROM documents")
        return cursor.fetchall()
    except Error as e:
        print(f"Error getting documents: {e}")
        raise
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()


def get_document_filename(doc_id:int):
    conn=get_db_connection()
    try:
        cursor=conn.cursor()
        cursor.execute("SELECT filename FROM documents WHERE id=%s", (doc_id,))
        return cursor.fetchone()[0] 
    except Error as e:
        print(f"Error getting document filename: {e}")
        raise
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()