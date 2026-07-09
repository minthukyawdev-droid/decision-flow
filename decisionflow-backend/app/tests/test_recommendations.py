from fastapi.testclient import TestClient


def test_create_recommendation_and_history(client: TestClient, auth_headers: dict[str, str]):
    decision_response = client.post(
        "/api/v1/decisions",
        headers=auth_headers,
        json={
            "title": "Pick hosting platform",
            "criteria": [{"name": "Cost", "weight": 5}, {"name": "Reliability", "weight": 5}],
        },
    )
    decision_id = decision_response.json()["data"]["id"]

    recommendation_response = client.post(
        f"/api/v1/decisions/{decision_id}/recommendations",
        headers=auth_headers,
        json={"options": ["Platform A", "Platform B"]},
    )

    assert recommendation_response.status_code == 201
    recommendation = recommendation_response.json()["data"]
    assert recommendation["recommended_option"] == "Platform A"
    assert recommendation["confidence_score"] >= 60

    history_response = client.get(
        f"/api/v1/decisions/{decision_id}/recommendations",
        headers=auth_headers,
    )
    assert history_response.status_code == 200
    assert len(history_response.json()["data"]) == 1
