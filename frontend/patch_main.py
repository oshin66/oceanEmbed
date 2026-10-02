import sys

with open("/Users/oshinmendhe10gmail.com/Desktop/OceanEmbed_Backend/app/main.py", "r") as f:
    content = f.read()

new_endpoint = """
@app.get("/reconstruction-map")
def reconstruction_map(date: str, depth: int):
    from .inference import get_reconstruction_map
    try:
        res = get_reconstruction_map(date, depth)
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
"""

if "/reconstruction-map" not in content:
    with open("/Users/oshinmendhe10gmail.com/Desktop/OceanEmbed_Backend/app/main.py", "a") as f:
        f.write(new_endpoint)
    print("Added /reconstruction-map to main.py")
else:
    print("Already exists")
