from io import BytesIO

from fastapi.testclient import TestClient


def create_decision(client: TestClient, auth_headers: dict[str, str]) -> str:
    response = client.post(
        "/api/v1/decisions",
        headers=auth_headers,
        json={"title": "Choose vendor", "criteria": [{"name": "Risk", "weight": 3}]},
    )
    return response.json()["data"]["id"]


def test_paste_transcript_and_review_extraction(client: TestClient, auth_headers: dict[str, str]):
    decision_id = create_decision(client, auth_headers)

    response = client.post(
        f"/api/v1/decisions/{decision_id}/transcripts/paste",
        headers=auth_headers,
        json={"content": "Option Alpha has lower cost. Criterion risk matters a lot."},
    )

    assert response.status_code == 201
    transcript = response.json()["data"]
    assert transcript["source_type"] == "paste"
    assert transcript["extracted_information"]["summary"].startswith("Option Alpha")

    extracted_response = client.get(
        f"/api/v1/decisions/{decision_id}/transcripts/{transcript['id']}/extracted",
        headers=auth_headers,
    )
    assert extracted_response.status_code == 200
    assert "options" in extracted_response.json()["data"]


def test_upload_transcript_validates_file_type(client: TestClient, auth_headers: dict[str, str]):
    decision_id = create_decision(client, auth_headers)

    response = client.post(
        f"/api/v1/decisions/{decision_id}/transcripts/upload",
        headers=auth_headers,
        files={"file": ("notes.pdf", BytesIO(b"not a real pdf"), "application/pdf")},
    )

    assert response.status_code == 400
    assert response.json()["success"] is False


def test_upload_transcript_accepts_text_file(client: TestClient, auth_headers: dict[str, str]):
    decision_id = create_decision(client, auth_headers)

    response = client.post(
        f"/api/v1/decisions/{decision_id}/transcripts/upload",
        headers=auth_headers,
        files={"file": ("notes.txt", BytesIO(b"Option A is fastest. Factor cost is important."), "text/plain")},
    )

    assert response.status_code == 201
    assert response.json()["data"]["file_name"] == "notes.txt"


def test_upload_transcript_accepts_text_file_with_generic_content_type(client: TestClient, auth_headers: dict[str, str]):
    decision_id = create_decision(client, auth_headers)

    response = client.post(
        f"/api/v1/decisions/{decision_id}/transcripts/upload",
        headers=auth_headers,
        files={"file": ("notes.txt", BytesIO(b"Option A is fastest. Factor cost is important."), "application/octet-stream")},
    )

    assert response.status_code == 201
    assert response.json()["data"]["file_name"] == "notes.txt"
