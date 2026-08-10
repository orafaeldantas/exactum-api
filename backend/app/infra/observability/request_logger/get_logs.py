import glob
import json
import os

LOG_DIR = "logs"
LOG_PATTERN = "infra.log*"


def latest_request_logs() -> dict:

    message_error = {"error": "error", "status": 404}

    log_files = glob.glob(os.path.join(LOG_DIR, LOG_PATTERN))

    if not log_files:
        message_error["error"] = "no logs found"
        message_error["status"] = 404
        return message_error

    log_files.sort(key=os.path.getmtime, reverse=True)
    latest_file = log_files[0]

    entries = []
    try:
        with open(latest_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        message_error["error"] = f"Error reading log file: {str(e)}"
        message_error["status"] = 500
        return message_error

    entries = entries[-10000:][::-1]

    return {
        "file": str(os.path.basename(latest_file)),
        "count": int(len(entries)),
        "logs": entries,
    }
