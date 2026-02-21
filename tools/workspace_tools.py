#!/usr/bin/env python3
"""
Google Workspace tools using Service Account
Works for: Docs, Sheets
Requires domain delegation for: Gmail
"""

import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Service account credentials
SERVICE_ACCOUNT_FILE = '/root/.openclaw/workspace/hub/tools/service-account.json'
SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
]

def get_credentials():
    return service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

def create_doc(title, content=""):
    """Create a Google Doc"""
    creds = get_credentials()
    service = build('docs', 'v1', credentials=creds)
    
    doc = service.documents().create(body={'title': title}).execute()
    doc_id = doc.get('documentId')
    
    if content:
        service.documents().batchUpdate(
            documentId=doc_id,
            body={
                'requests': [{
                    'insertText': {
                        'location': {'index': 1},
                        'text': content
                    }
                }]
            }
        ).execute()
    
    print(f"📄 Doc created: {title}")
    print(f"Link: https://docs.google.com/document/d/{doc_id}/edit")
    return doc_id

def create_sheet(title, data=None):
    """Create a Google Sheet"""
    creds = get_credentials()
    service = build('sheets', 'v4', credentials=creds)
    
    sheet = service.spreadsheets().create(
        body={'properties': {'title': title}}
    ).execute()
    sheet_id = sheet.get('spreadsheetId')
    
    if data:
        service.spreadsheets().values().update(
            spreadsheetId=sheet_id,
            range='Sheet1!A1',
            valueInputOption='RAW',
            body={'values': data}
        ).execute()
    
    print(f"📊 Sheet created: {title}")
    print(f"Link: https://docs.google.com/spreadsheets/d/{sheet_id}/edit")
    return sheet_id

def list_files():
    """List recent files"""
    creds = get_credentials()
    service = build('drive', 'v3', credentials=creds)
    
    results = service.files().list(
        pageSize=10,
        fields="nextPageToken, files(id, name, mimeType)"
    ).execute()
    items = results.get('files', [])
    
    print("\\n📁 Recent files:")
    for item in items:
        print(f"  {item['name']} ({item['mimeType'].split('.')[-1]})")

if __name__ == '__main__':
    print("Google Workspace Tools (Docs & Sheets)")
    print("\\nTesting...")
    
    # Test doc creation
    # create_doc("Test Doc", "Hello from Mission Control!")
    
    # Test sheet creation  
    # create_sheet("Test Sheet", [["Name", "Status"], ["Task 1", "Done"]])
    
    print("\\nFunctions available:")
    print("  create_doc(title, content)  - Create Google Doc")
    print("  create_sheet(title, data)   - Create Google Sheet")
    print("  list_files()                - List Drive files")
