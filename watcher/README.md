# Applud Watcher

This is the watcher service for Applud. It watches for new files in the directory specified in the .env file and transcribes them using `insanely-fast-whisper`.
This is not containerized due to lack of Apple Metal support in Docker. 

## Requirements

- `ffmpeg`
- `python3` (3.11 specifically)
- `pip`

## Usage

1. Create a `.env` file in the project root
    - `cp .env.example .env`

2. Set the `WATCHER_DIR` variable to the directory you want to watch
    - `WATCHER_DIR=/Users/Example/Library/Mobile Documents/com~apple~CloudDocs`

3. Create a [HuggingFace API key](https://huggingface.co/settings/tokens) and set the `HUGGINGFACE_TOKEN` variable in the `.env` file
    - Grant access to [pyannote/speaker-diarization-3.1](https://huggingface.co/pyannote/speaker-diarization-3.1)
    - Grant access to [pyannote/segmentation-3.0](https://huggingface.co/pyannote/segmentation-3.0)

4. Install the requirements
    - `brew install ffmpeg`, `apt install ffmpeg`, or whatever your package manager is
    - Create a Python3.11 virtual environment: `python3.11 -m venv .venv`
    - Activate the virtual environment: `source .venv/bin/activate`
    - Install the requirements: `pip install -r watcher/requirements.txt --break-system-packages`

5. Run the script
    - `python3 watcher/main.py`

## Workflow

1. User uploads a file to their watched directory (e.g. iCloud Drive)
2. Watcher detects the file, converts it to mp3 if necessary, and transcribes it
3. Watcher compresses the transcript and audio files using gzip and uploads them to the backend
4. Backend processes the files and stores them in the database
5. User can access the frontend to view the transcript and audio files
