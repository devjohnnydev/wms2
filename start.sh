#!/bin/bash
export PATH="/opt/venv/bin:$PATH"
export PYTHONPATH=$PYTHONPATH:$(pwd)/SGA-Backend
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/lib/x86_64-linux-gnu

# Inicia o backend (que serve o frontend)
cd SGA-Backend
uvicorn app.main:app --host 0.0.0.0 --port $PORT
