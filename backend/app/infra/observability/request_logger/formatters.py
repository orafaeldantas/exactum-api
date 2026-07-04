import json


def build_request_log(payload: dict) -> str:
    return json.dumps(
        payload,
        ensure_ascii=False,
    )
