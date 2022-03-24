from fastapi import APIRouter


from app.v1.project.events import endpoints as event_endpoints

events_router = APIRouter()
