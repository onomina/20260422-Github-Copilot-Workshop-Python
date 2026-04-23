# Flaskによるポモドーロタイマー最小構成
from flask import Flask, render_template

WORK_MINUTES = 1
INITIAL_SECONDS = 0

app = Flask(__name__)

@app.route('/')
def index():
	return render_template('index.html', work_minutes=WORK_MINUTES, initial_seconds=INITIAL_SECONDS)

if __name__ == '__main__':
	app.run()
