#!/bin/bash
set -e
cd /home/site/wwwroot
exec gunicorn -w 2 -k uvicorn.workers.UvicornWorker TTS:app --bind "0.0.0.0:${PORT:-8000}" --timeout 120 --access-logfile - --error-logfile -
