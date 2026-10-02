from fastapi import FastAPI
from fastapi.testclient import TestClient
import numpy as np
import math

app = FastAPI()

@app.get("/")
def read_root():
    # Numpy nan
    arr = np.array([1.0, np.nan, 3.0])
    return {"values": arr.tolist()}

client = TestClient(app)
try:
    response = client.get("/")
    print("Response status:", response.status_code)
    print("Response json:", response.json())
except Exception as e:
    print("Error:", type(e), e)
