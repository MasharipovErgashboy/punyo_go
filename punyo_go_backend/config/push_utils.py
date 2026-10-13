"""Expo push notification helper.

Sends push notifications to restaurant devices via Expo's push service.
No SDK needed — a single HTTPS POST to exp.host.
Docs: https://docs.expo.dev/push-notifications/sending-notifications/
"""
import json
import requests


EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_expo_push(tokens, title, body, data=None, sound="default"):
    """Send a push notification to one or more Expo push tokens.

    `tokens` may be a single string or an iterable of strings.
    Returns the number of messages accepted by Expo (best-effort, never raises).
    """
    if not tokens:
        return 0
    if isinstance(tokens, str):
        tokens = [tokens]

    messages = [
        {
            "to": t,
            "title": title,
            "body": body,
            "sound": sound,
            "priority": "high",
            "channelId": "orders",
            "data": data or {},
        }
        for t in tokens
        if t
    ]
    if not messages:
        return 0

    try:
        resp = requests.post(
            EXPO_PUSH_URL,
            data=json.dumps(messages),
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
            },
            timeout=10,
        )
        print(f"[expo-push] sent {len(messages)} -> {resp.status_code}: {resp.text[:300]}")
        return len(messages)
    except Exception as e:
        print(f"[expo-push] error: {e}")
        return 0
