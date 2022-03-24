import httpx


async def get_http_client():
    async with httpx.AsyncClient() as http_client:
        yield http_client
