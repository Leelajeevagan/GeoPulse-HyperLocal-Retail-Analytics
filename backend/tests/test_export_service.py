def test_get_report_templates(client):
    response = client.get("/api/reports/templates")
    assert response.status_code == 200
    templates = response.json()
    assert isinstance(templates, list)
    assert len(templates) >= 4

def test_get_export_ledger(client):
    response = client.get("/api/reports/ledger")
    assert response.status_code == 200
    ledger = response.json()
    assert isinstance(ledger, list)

def test_generate_csv_report(client):
    payload = {
        "report_title": "Automated Test CSV Report",
        "cluster_scope": "all",
        "format": "csv",
        "time_window": "30d",
        "telemetry_metrics": ["footfall_density", "sales_correlation"]
    }
    response = client.post("/api/reports/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Completed"
    assert "download_url" in data
