import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter
from openai import OpenAI
from pydantic import BaseModel, Field

from app.schemas import Success, Fail

# 加载 .env(位于 app/.env)
load_dotenv(Path(__file__).resolve().parents[3] / ".env")

router = APIRouter()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL) if DEEPSEEK_API_KEY else None

SYSTEM_PROMPT = """You are BrewGuard AI Assistant, an intelligent helper for the BrewGuard brewing detection system.

BrewGuard is an intelligent detection platform for modern brewing production. It covers:
- Fermentation batch management (batch number, recipe, status: fermenting/completed/abnormal)
- Detection data recording (temperature, pH, ABV - alcohol by volume)
- Real-time monitoring and smart alerts
- Batch traceability and quality reports

Your role:
- Answer questions about brewing fermentation, detection metrics, and how to use BrewGuard
- Help users understand temperature/pH/ABV ranges for different brew types
- Provide guidance on troubleshooting abnormal batches
- Be concise, professional, and helpful

Keep responses focused and practical. If asked about unrelated topics, gently redirect to brewing detection."""

class ChatRequest(BaseModel):
    message: str = Field(..., description="用户消息")


@router.post("/chat", summary="AI 助手对话")
async def chat(req: ChatRequest):
    if not client:
        return Fail(code=503, msg="AI service is not configured. Please set DEEPSEEK_API_KEY in app/.env")

    try:
        response = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": req.message}
            ],
            max_tokens=1024,
            temperature=0.7
        )
        reply = response.choices[0].message.content or ""
        return Success(data={"reply": reply})
    except Exception as e:
        return Fail(code=500, msg=f"AI request failed: {str(e)}")
