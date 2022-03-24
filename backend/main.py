import uvicorn
import os

from app.loader import create_fa_app

# consts.
PORT = int(os.environ.get("PORT", 5001))


app = create_fa_app()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, debug=True, reload=True)
