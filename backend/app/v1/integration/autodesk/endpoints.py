from fastapi import Depends
import http

import httpx

from app.v1.integration.autodesk import dependencies, autodesk
from app.http import get_http_client


async def get_profile(
    access_token=Depends(dependencies.generate_autodesk_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    profile = await autodesk.get_profile(
        access_token=access_token, http_client=http_client
    )
    return profile


async def get_projects(
    access_token=Depends(dependencies.generate_autodesk_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    projects = []

    hubs_ids = await autodesk.get_hub_ids(
        access_token=access_token, http_client=http_client
    )

    for h_id in hubs_ids:
        hub_projects = await autodesk.get_hub_projects(
            hub_id=h_id, access_token=access_token, http_client=http_client
        )

        projects.extend(
            [
                {
                    "id": p["id"],
                    "name": p["attributes"]["name"],
                    "root_folder_id": p["relationships"]["rootFolder"]["data"]["id"],
                }
                for p in hub_projects
            ]
        )

    return projects


async def get_projects(
    access_token=Depends(dependencies.generate_autodesk_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):
    projects = []

    hubs_ids = await autodesk.get_hub_ids(
        access_token=access_token, http_client=http_client
    )

    for h_id in hubs_ids:
        hub_projects = await autodesk.get_hub_projects(
            hub_id=h_id, access_token=access_token, http_client=http_client
        )

        projects.extend(
            [
                {
                    "id": p["id"],
                    "name": p["attributes"]["name"],
                    "root_folder_id": p["relationships"]["rootFolder"]["data"]["id"],
                }
                for p in hub_projects
            ]
        )

    return projects


async def fetch_folder_contents(
    project_id: str,
    folder_urn: str,
    access_token=Depends(dependencies.generate_autodesk_access_token),
    http_client: httpx.AsyncClient = Depends(get_http_client),
):

    contents = {"folders": [], "files": []}

    folder_contents = await autodesk.fetch_folder_contents(
        project_id=project_id,
        folder_urn=folder_urn,
        access_token=access_token,
        http_client=http_client,
    )

    for obj in folder_contents:
        if obj["type"] == "items":
            contents["files"].append(
                {"id": obj["id"], "name": obj["attributes"]["displayName"]}
            )
        elif obj["type"] == "folders":
            contents["folders"].append(
                {"id": obj["id"], "name": obj["attributes"]["name"]}
            )

    return contents
