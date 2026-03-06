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


def register_unit(guid: str):
    """Upsert a row in units using guid as the unique key.
    Sets guid, status='connected', and franchise_id.
    """
    load_dotenv(ENV_FILE)

    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    franchise_id = os.getenv("UNIT_DEFAULT_ID")

    if not supabase_url or not service_role_key:
        print("Supabase credentials not set — skipping unit registration.")
        return

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    try:
        # Check if a unit with this guid already exists
        get_response = requests.get(
            f"{supabase_url}/rest/v1/units",
            params={"guid": f"eq.{guid}", "select": "*"},
            headers=headers,
        )
        get_response.raise_for_status()
        existing_units = get_response.json()

        if existing_units:
            # Unit exists, just update its status
            unit_id = existing_units[0]['id']
            patch_response = requests.patch(
                f"{supabase_url}/rest/v1/units",
                params={"id": f"eq.{unit_id}"},
                json={"status": "connected"},
                headers=headers,
            )
            if patch_response.status_code in (200, 204):
                print(f"Unit updated in Supabase (guid={guid}).")
            else:
                print(f"Supabase update failed [{patch_response.status_code}]: {patch_response.text}")
        else:
            # Unit does not exist, insert it
            payload = {
                "guid": guid,
                "status": "connected",
                "franchise_id": franchise_id,
            }
            post_response = requests.post(
                f"{supabase_url}/rest/v1/units",
                json=payload,
                headers=headers,
            )
            if post_response.status_code in (200, 201):
                print(f"Unit registered in Supabase (guid={guid}).")
            else:
                print(f"Supabase insert failed [{post_response.status_code}]: {post_response.text}")

    except Exception as e:
        print(f"Error registering unit in Supabase: {e}")


def initialize_environment():
    if not os.path.exists(ENV_FILE):
        open(ENV_FILE, "a").close()

    guid = get_machine_guid()
    if guid:
        print(f"Found Machine GUID: {guid}")
        set_key(ENV_FILE, "GUID", guid)
        register_unit(guid)