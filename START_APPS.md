passwords-service:
uvicorn src.api.main:app --host 0.0.0.0 --port 8002 --reload

phishing-service:
uvicorn src.api.main:app --host 0.0.0.0 --port 8001 --reload

social-eng-service
uvicorn src.api.main:app --host 0.0.0.0 --port 8003 --reload

device-secure-service
uvicorn src.api.main:app --host 0.0.0.0 --port 8004 --reload

app-permission-service
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

just
python -m src.api.main


# Phishing
cd phishing-detection-service
python train_model.py

# Password
cd password-security-service
python train_model.py

# Social Engineering
cd social-engineering-service
python train_model.py