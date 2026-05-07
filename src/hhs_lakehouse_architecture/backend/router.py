from pathlib import Path

from databricks.sdk.service.iam import User as UserOut
from fastapi import HTTPException
from fastapi.responses import FileResponse

from .core import Dependencies, create_router
from .models import VersionOut

router = create_router()

_AUDIO_DIR = Path("/Workspace/Users/ashraf.osman@databricks.com/hhs-audio")


@router.get("/version", response_model=VersionOut, operation_id="version")
async def version():
    return VersionOut.from_metadata()


@router.get("/current-user", response_model=UserOut, operation_id="currentUser")
def me(user_ws: Dependencies.UserClient):
    return user_ws.current_user.me()


@router.get("/audio/{filename}", operation_id="getAudio", include_in_schema=False)
def get_audio(filename: str):
    if not filename.endswith(".mp3") or "/" in filename:
        raise HTTPException(status_code=400)
    path = _AUDIO_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404)
    return FileResponse(path, media_type="audio/mpeg")
