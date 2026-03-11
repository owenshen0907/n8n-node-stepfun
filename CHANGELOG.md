# Changelog

## 2.0.0 - 2026-03-12

Breaking changes:

- The TTS node now always requests signed audio URLs from the Stepfun API.
- The node no longer returns `binary.audio`.
- The `Return URL` parameter has been removed from the node UI.
- The node output is now simplified to `json.created` and `json.audioUrl`.

Improvements:

- `Output Format` now describes the format of the generated file URL.
- The README now documents the URL-first workflow for downstream n8n nodes.
