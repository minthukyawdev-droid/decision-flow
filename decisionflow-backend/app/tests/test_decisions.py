from fastapi.testclient import TestClient


def test_decision_crud_flow(client: TestClient, auth_headers: dict[str, str]):
    create_response = client.post(
        "/api/v1/decisions",
        headers=auth_headers,
        json={
            "title": "Choose CRM",
            "description": "Select a CRM for sales",
            "criteria": [{"name": "Cost", "weight": 5}, {"name": "Ease of use", "weight": 4}],
        },
    )
    assert create_response.status_code == 201
    decision = create_response.json()["data"]
    assert decision["title"] == "Choose CRM"
    assert len(decision["criteria"]) == 2

    decision_id = decision["id"]
    list_response = client.get("/api/v1/decisions", headers=auth_headers)
    assert list_response.status_code == 200
    assert len(list_response.json()["data"]) == 1

    update_response = client.patch(
        f"/api/v1/decisions/{decision_id}",
        headers=auth_headers,
        json={"status": "in_review"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["status"] == "in_review"

    put_response = client.put(
        f"/api/v1/decisions/{decision_id}",
        headers=auth_headers,
        json={"criteria": [{"name": "Cost", "weight": 6}]},
    )
    assert put_response.status_code == 200
    assert put_response.json()["data"]["criteria"][0]["weight"] == 6

    delete_response = client.delete(f"/api/v1/decisions/{decision_id}", headers=auth_headers)
    assert delete_response.status_code == 200

    get_response = client.get(f"/api/v1/decisions/{decision_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_decisions_require_authentication(client: TestClient):
    response = client.get("/api/v1/decisions")

    assert response.status_code == 401
