import os
from google.cloud import storage

BUCKET_NAME = os.getenv("GCS_BUCKET_NAME", "flashcardapp-db-bucket")
DB_FILENAME = "flashcardapp.db"

# Use /tmp on Cloud Run for lightning-fast POSIX SQLite file locks
if os.path.exists("/tmp"):
    LOCAL_DB_PATH = os.path.join("/tmp", DB_FILENAME)
else:
    LOCAL_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", DB_FILENAME))


def download_db_from_gcs():
    """Downloads DB file from GCS to local fast disk at container startup."""
    try:
        if not os.getenv("GCP_PROJECT") and not os.getenv("K_SERVICE"):
            return
        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(DB_FILENAME)
        if blob.exists():
            os.makedirs(os.path.dirname(LOCAL_DB_PATH), exist_ok=True)
            blob.download_to_filename(LOCAL_DB_PATH)
            print(f"[GCS DB Sync] Successfully downloaded {DB_FILENAME} from GCS bucket '{BUCKET_NAME}'.")
        else:
            print(f"[GCS DB Sync] No existing DB found in GCS bucket '{BUCKET_NAME}'. A new DB will be initialized.")
    except Exception as e:
        print(f"[GCS DB Sync Warning] Could not sync from GCS: {e}")


def upload_db_to_gcs():
    """Uploads local DB snapshot to GCS after writes to preserve persistence across container restarts."""
    try:
        if not os.path.exists(LOCAL_DB_PATH):
            return
        if not os.getenv("GCP_PROJECT") and not os.getenv("K_SERVICE"):
            return
        client = storage.Client()
        bucket = client.bucket(BUCKET_NAME)
        blob = bucket.blob(DB_FILENAME)
        blob.upload_from_filename(LOCAL_DB_PATH)
        print(f"[GCS DB Sync] Successfully uploaded {DB_FILENAME} to GCS bucket '{BUCKET_NAME}'.")
    except Exception as e:
        print(f"[GCS DB Sync Error] Failed to upload DB to GCS: {e}")
