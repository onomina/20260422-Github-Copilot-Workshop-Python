
import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app

class TestPomodoroApp(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_index_route(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        body = response.get_data(as_text=True)
        self.assertIn('ポモドーロタイマー', body)
        self.assertIn('ゲーミフィケーション', body)
        self.assertIn('週間 / 月間統計', body)

if __name__ == '__main__':
    unittest.main()
