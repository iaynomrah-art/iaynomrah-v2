# startup.py

import socket
import requests
import winreg
import os
from dotenv import load_dotenv, set_key

ENV_FILE = ".env"


def get_machine_guid() -> str:
    try:
        registry = winreg.ConnectRegistry(None, winreg.HKEY_LOCAL_MACHINE)
        key = winreg.OpenKey(registry, r"SOFTWARE\Microsoft\Cryptography")
        guid, _ = winreg.QueryValueEx(key, "MachineGuid")
        winreg.CloseKey(key)
        return guid
    except Exception as e:
        print(f"Failed to get Machine GUID: {e}")
        return ""


def register_bot(guid: str):
    """Upsert a row in bot_monitoring using guid as the unique key.
    Only sets guid and status='Idle' — pc_name is assigned by DB trigger.
    """
    load_dotenv(ENV_FILE)

    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    franchise_id = os.getenv("UNIT_DEFAULT_ID")

    if not supabase_url or not service_role_key:
        print("Supabase credentials not set — skipping bot registration.")
        return

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    payload = {
        "guid": guid,
        "status": "Idle",
        "franchise_id": franchise_id,
    }

    try:
        response = requests.post(
            f"{supabase_url}/rest/v1/bot_monitoring",
            params={"on_conflict": "guid"},
            json=payload,
            headers=headers,
        )
        if response.status_code in (200, 201):
            data = response.json()
            action = "registered" if isinstance(data, list) and data else "updated"
            print(f"Bot {action} in Supabase (guid={guid}).")
        else:
            print(f"Supabase upsert failed [{response.status_code}]: {response.text}")
    except Exception as e:
        print(f"Error registering bot in Supabase: {e}")


def initialize_environment():
    if not os.path.exists(ENV_FILE):
        open(ENV_FILE, "a").close()

    guid = get_machine_guid()
    if guid:
        print(f"Found Machine GUID: {guid}")
        set_key(ENV_FILE, "GUID", guid)
        register_bot(guid)