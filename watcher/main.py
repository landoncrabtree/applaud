from watchfiles import Change, watch
import time
import subprocess
import os
import shutil
import dotenv
import requests
import base64
import gzip

dotenv.load_dotenv()

WATCHER_DIR = os.getenv('WATCHER_DIR') or exit("WATCHER_DIR not set")
WATCHER_OUTPUT_DIR = os.getenv('WATCHER_OUTPUT_DIR') or exit("WATCHER_OUTPUT_DIR not set")
TRANSCRIPTION_MODEL = os.getenv('TRANSCRIPTION_MODEL') or exit("TRANSCRIPTION_MODEL not set")
HUGGINGFACE_TOKEN = os.getenv('HUGGINGFACE_TOKEN') or exit("HUGGINGFACE_TOKEN not set")
DIARIZATION_MODEL = os.getenv('DIARIZATION_MODEL') or exit("DIARIZATION_MODEL not set")
TRANSCRIPTION_DEVICE_ID = os.getenv('TRANSCRIPTION_DEVICE_ID') or exit("TRANSCRIPTION_DEVICE_ID not set")
AUDIO_EXTENSIONS = ["m4a", "wav", "flac", "ogg", "aac"] # Common audio file extensions besides mp3

"""
Import transcript and audio files to the backend
"""
def upload_files(path: str):
    try:
        # Read and gzip the transcript
        with open(f"{path}/transcript.json", "r") as f:
            transcript_bytes = f.read().encode('utf-8')
            transcript_gzipped = gzip.compress(transcript_bytes)
            transcript_data = base64.b64encode(transcript_gzipped).decode('utf-8')

        # Read and gzip the audio
        with open(f"{path}/recording.mp3", "rb") as f:
            audio_bytes = f.read()
            audio_gzipped = gzip.compress(audio_bytes)
            audio_data = base64.b64encode(audio_gzipped).decode('utf-8')

        payload = {
            "transcript": transcript_data,
            "audio": audio_data,
            "compressed": True
        }        
        
        response = requests.post(
            "http://localhost:8080/api/v1/upload",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print(f"[Applaud] Failed to upload files: {response.json().get('error', 'Unknown error')}")
            return False
            
        print(f"[Applaud] Successfully uploaded files with ID: {response.json().get('id')}")
        return True
        
    except Exception as e:
        print(f"[Applaud] Error uploading files: {str(e)}")
        return False

"""
Get the filename from a path
"""
def get_filename(path: str) -> str:
    return path.split("/")[-1].split(".")[0]

"""
Get the file extension from a path
"""
def get_file_extension(path: str) -> str:
    return path.split("/")[-1].split(".")[-1]

"""
Filter for only added files
"""
def only_added(change: Change, path: str) -> bool:
    return change == Change.added

"""
Convert audio file to mp3 for transcription
"""
def convert_audio_to_mp3(path: str) -> str:
    print(f"[Applaud] Converting {path} to mp3...")
    newFilename = time.strftime("%d-%m-%Y_%I-%M-%S-%p")
    newFilePath = f"{WATCHER_DIR}/{newFilename}.mp3"
    cmd = f"ffmpeg -i \"{path}\" -vn -ar 16000 -q:a 2 \"{newFilePath}\""
    subprocess.run(cmd, shell=True)

"""
Create a recursive directory if it doesn't exist
"""
def create_recursive_directory(path: str):
    print(f"[Applaud] Creating directory: {path}")
    os.makedirs(path, exist_ok=True)

"""
Transcribe .mp3 file using insanely-fast-whisper
"""
def transcribe(path: str, currentTimestamp: str):
    print(f"[Applaud] Transcribing {path}...")
    cmd = f"insanely-fast-whisper --model-name {TRANSCRIPTION_MODEL} --file-name \"{path}\" --device-id {TRANSCRIPTION_DEVICE_ID} --hf-token {HUGGINGFACE_TOKEN} --transcript-path \"{WATCHER_OUTPUT_DIR}/{currentTimestamp}/transcript.json\""
    subprocess.run(cmd, shell=True)
    

print("[Applaud] Watching for new files...")

try:
    for changes in watch(WATCHER_DIR, watch_filter=only_added, force_polling=True):
        for change, path in changes:
            print(f"[Applaud] New file detected: {path}")
            currentTimestamp = time.strftime("%d-%m-%Y_%I-%M-%S-%p")
            file_extension = get_file_extension(path).lower()
            
            if file_extension in AUDIO_EXTENSIONS:
                convert_audio_to_mp3(path)
                print(f"[Applaud] Removing original file: {path}")
                os.remove(path)
                continue
            elif file_extension == "mp3":
                output_dir = f"{WATCHER_OUTPUT_DIR}/{currentTimestamp}"
                create_recursive_directory(output_dir)
                transcribe(path, currentTimestamp)
                print(f"[Applaud] Moving {path} to transcript directory...")
                shutil.copy2(path, f"{output_dir}/recording.mp3")
                print(f"[Applaud] Removing original file: {path}")
                os.remove(path)
                
                if upload_files(output_dir):
                    print(f"[Applaud] Cleaning up output directory...")
                    shutil.rmtree(output_dir)
                continue
            else:
                print(f"[Applaud] Skipping file: {path}")
                continue
except KeyboardInterrupt:
    print("[Applaud] Exiting...")
    exit(0)
