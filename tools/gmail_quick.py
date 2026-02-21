#!/usr/bin/env python3
"""
Simple Google tools using Application Default Credentials
"""

import os
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.expanduser('~/.config/gcloud/application_default_credentials.json')

from google.auth import default
from googleapiclient.discovery import build

def get_gmail_service():
    creds, _ = default(scopes=['https://www.googleapis.com/auth/gmail.readonly'])
    return build('gmail', 'v1', credentials=creds)

def list_recent_emails(max_results=5):
    """List recent emails"""
    try:
        service = get_gmail_service()
        results = service.users().messages().list(userId='me', maxResults=max_results).execute()
        messages = results.get('messages', [])
        
        print(f"\\n📧 Recent emails ({len(messages)}):\\n")
        for msg in messages:
            message = service.users().messages().get(userId='me', id=msg['id'], format='metadata').execute()
            headers = message['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            print(f"From: {sender}")
            print(f"Subject: {subject}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {e}")
        print("\\nNote: Gmail requires additional OAuth consent. May need to use web auth flow.")

if __name__ == '__main__':
    list_recent_emails()
