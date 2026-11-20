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
    assert "items" in ledger
    assert isinstance(ledger["items"], list)

def test_generate_csv_report(client):
    payload = {
        "title": "Automated Test CSV Report",
        "category": "Footfall Summary",
        "output_format": "CSV",
        "store_cluster": "All Boston Retail Nodes",
        "selected_metrics": ["footfall_density", "sales_correlation"]
    }
    response = client.post("/api/reports/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["Completed", "Ready"]
    assert "download_url" in data
