import io
import sys
import time
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
import main

class Page:
    def extract_text(self):
        return 'CSS layout uses grids. Accessible forms need labels.'
class Reader:
    is_encrypted = False
    pages = [Page()]

class StudyTests(unittest.TestCase):
    def setUp(self):
        main.sessions.clear()
        self.client = TestClient(main.app)
    def upload(self, consent='true'):
        with patch.object(main, 'PdfReader', return_value=Reader()):
            return self.client.post('/upload', files={'file': ('../../example.pdf', io.BytesIO(b'%PDF-sample'), 'application/pdf')}, data={'consent': consent})
    def test_search_isolation_and_delete(self):
        response = self.upload()
        self.assertEqual(response.status_code, 200)
        token = response.json()['token']
        headers = {'Authorization': 'Bearer ' + token}
        result = self.client.post('/ask', headers=headers, json={'question': 'CSS layout'})
        self.assertEqual(result.json()['matches'][0]['page'], 1)
        self.assertEqual(self.client.post('/ask', json={'question': 'CSS layout'}).status_code, 401)
        self.assertEqual(self.client.delete('/document', headers=headers).status_code, 204)
        self.assertEqual(self.client.post('/ask', headers=headers, json={'question': 'CSS layout'}).status_code, 401)
    def test_validation_and_consent(self):
        self.assertEqual(self.upload('false').status_code, 400)
        self.assertEqual(self.client.post('/upload', files={'file': ('bad.pdf', b'not pdf')}, data={'consent': 'true'}).status_code, 415)
        self.assertEqual(self.client.post('/ask', json={'question': ''}).status_code, 422)
    def test_expiry(self):
        token = self.upload().json()['token']
        main.sessions[token] = (time.monotonic() - 1, [(1, 'private text')])
        self.assertEqual(self.client.post('/ask', headers={'Authorization': 'Bearer ' + token}, json={'question': 'private'}).status_code, 401)
        self.assertNotIn(token, main.sessions)
    def test_actual_pdf_parser(self):
        from pypdf import PdfWriter
        output = io.BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(width=72, height=72)
        writer.write(output)
        response = self.client.post('/upload', files={'file': ('empty.pdf', output.getvalue())}, data={'consent': 'true'})
        self.assertEqual(response.status_code, 422)
    def test_capacity(self):
        for i in range(20):
            main.sessions[str(i)] = (time.monotonic() + 100, [])
        self.assertEqual(self.upload().status_code, 503)

if __name__ == '__main__':
    unittest.main()
