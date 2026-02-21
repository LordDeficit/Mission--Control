#!/usr/bin/env python3
"""
Google Workspace tools for Mission Control
Gmail, Docs, Sheets access
"""

import os
import json
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle

# Scopes needed
SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
]

def get_service(service_name, version):
    """Get authenticated service"""
    creds = None
    # Check if token exists
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # If no valid creds, let user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            print("Need to authenticate. Run: python3 google_tools.py --auth")
            return None
    
    return build(service_name, version, credentials=creds)

def list_emails(max_results=10):
    """List recent emails"""
    service = get_service('gmail', 'v1')
    if not service:
        return
    
    results = service.users().messages().list(userId='me', maxResults=max_results).execute()
    messages = results.get('messages', [])
    
    print(f"\\n📧 Recent emails ({len(messages)}):\\n")
    for msg in messages:
        message = service.users().messages().get(userId='me', id=msg['id']).execute()
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No subject')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
        print(f"From: {sender}")
        print(f"Subject: {subject}")
        print(f"Snippet: {message.get('snippet', '')[:100]}...")
        print("-" * 50)

def send_email(to, subject, body):
    """Send an email"""
    service = get_service('gmail', 'v1')
    if not service:
        return
    
    message = {
        'raw': base64.urlsafe_b64encode(
            f"To: {to}\\nSubject: {subject}\\n\\n{body}".encode('utf-8')
        ).decode('utf-8')
    }
    
    service.users().messages().send(userId='me', body=message).execute()
    print(f"✉️  Email sent to {to}")

def create_doc(title, content=""):
    """Create a Google Doc"""
    service = get_service('docs', 'v1')
    if not service:
        return
    
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
    
    print(f"📄 Doc created: {doc.get('title')}")
    print(f"Link: https://docs.google.com/document/d/{doc_id}/edit")
    return doc_id

def create_sheet(title):
    """Create a Google Sheet"""
    service = get_service('sheets', 'v4')
    if not service:
        return
    
    sheet = service.spreadsheets().create(body={'properties': {'title': title}}).execute()
    sheet_id = sheet.get('spreadsheetId')
    
    print(f"📊 Sheet created: {sheet.get('properties', {}).get('title')}")
    print(f"Link: https://docs.google.com/spreadsheets/d/{sheet_id}/edit")
    return sheet_id

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--auth':
        # Run authentication flow
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
        print("✅ Authentication saved!")
    else:
        print("Google Workspace Tools for Mission Control")
        print("\\nUsage:")
        print("  python3 google_tools.py --auth     # Authenticate first")
        print("  python3 google_tools.py            # Run tests")
        print("\\nFunctions available:")
        print("  list_emails()       # List recent emails")
        print("  send_email(to, subject, body)  # Send email")
        print("  create_doc(title, content)     # Create Google Doc")
        print("  create_sheet(title)            # Create Google Sheet")
