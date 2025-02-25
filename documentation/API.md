# API Documentation

## Upload

### POST /api/v1/upload

Uploads a transcript to the backend.

#### Request Body

Expects a base64 encoded representation of a gzip'd transcript (JSON) and audio file (mp3).


```json
{
  "transcript": "string",
  "audio": "string"
}
```

#### Response

```json
{
  "message": "Files uploaded and processed successfully",
  "id": "string"
}
```

### POST /api/v1/upload/recording

Uploads an audio recording to the backend.

#### Request Body

Expects an audio file (mp3).

#### Response

```json
{
  "message": "Audio file uploaded successfully",
}
```

## Transcript

### GET /api/v1/transcript/all

Gets all transcript ids.

#### Response

```json
{
  "ids": ["string"]
}
```

### GET /api/v1/transcript/:id

Gets a transcript by id.

#### Response

Audio is returned as a base64 encoded string of the gzipped mp3 file.

```json
{
  "transcript": {
    "speakers": [
        {
            "speaker": "SPEAKER_01",
            "timestamp": [4.4, 5.28],
            "text": "Hello, how are you?"
        }
    ],
    "text": "Hello, how are you?",
  },
  "audio": "string"
}
```

### GET /api/v1/transcript/:id/audio

Gets the audio file for a transcript by id.

#### Response

Audio is returned as a base64 encoded string of the gzipped mp3 file.

```json
{
  "audio": "string"
}
```

### GET /api/v1/transcript/:id/transcript

Gets the transcript for a transcript by id.

#### Response

```json
{
  "transcript": {
    "speakers": [
        {
            "speaker": "SPEAKER_01",
            "timestamp": [4.4, 5.28],
            "text": "Hello, how are you?"
        }
    ],
    "text": "Hello, how are you?"
  }
}
```

### PATCH /api/v1/transcript/:id/name

Updates the name of a transcript by id.

#### Request Body

```json
{
  "name": "string"
}
```

#### Response

```json
{
  "message": "Name updated"
}
```

### PATCH /api/v1/transcript/:id/description

Updates the description of a transcript by id.

#### Request Body

```json
{
  "description": "string"
}
```

#### Response

```json
{
  "message": "Description updated"
}
```

### DELETE /api/v1/transcript/:id

Deletes a transcript by id.

#### Response

```json
{
  "message": "Transcript deleted"
}
```

### PATCH /api/v1/transcript/:id/speakers

Updates the speakers of a transcript by id.

#### Request Body

```json
{
  "oldSpeaker": "SPEAKER_01",
  "newSpeaker": "John Doe"
}
```

## Summarize

### GET /api/v1/summarize/:id

Uses the configured LLM to summarize a transcript by id.

#### Response

```json
{
  "content": {
    "summary": "An example summary of the transcript."
  }
}
```

### GET /api/v1/summarize/flashcards/:id

Uses the configured LLM to generate flashcards from a transcript by id.

#### Response

```json
{
  "content": {
    "flashcards": [
      {
        "front": "An example flashcard.",
        "back": "An example flashcard."
      }
    ]
  }
}
```

### GET /api/v1/summarize/questions/:id

Uses the configured LLM to generate questions from a transcript by id.

#### Response

```json
{
  "content": {
    "questions": [
        "What do we do?"
    ]
  }
}
```

### POST /api/v1/summarize/question/:id

Uses the configured LLM to answer a question from a transcript by id.

#### Request Body

```json
{
  "question": "Who spoke the most?"
}
```

#### Response

```json
{
  "content": {
    "response": "Speaker 01"
  }
}
```

## Settings

### PATCH /api/v1/settings/update

Updates the settings.

#### Request Body

```json
[
    {
        "key": "provider",
        "value": "openai"
    },
    {
        "key": "model",
        "value": "gpt-4o"
    }
]
```

#### Response

```json
{
  "message": "Settings updated"
}
```