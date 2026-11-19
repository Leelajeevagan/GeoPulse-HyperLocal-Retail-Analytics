def test_get_overview_kpis(client):
    response = client.get("/api/overview/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "total_customer_visits" in data
    assert "stores_monitored" in data
    assert "tracked_revenue" in data
    assert data["stores_monitored"] >= 0

def test_get_live_feed(client):
    response = client.get("/api/overview/live-feed")
    assert response.status_code == 200
    data = response.json()
    assert "total_visits" in data
    assert "total_revenue" in data
    assert "store_updates" in data
    assert isinstance(data["store_updates"], list)

def test_get_sales_correlation(client):
    response = client.get("/api/overview/sales-correlation")
    assert response.status_code == 200
    data = response.json()
    assert "correlation_coefficient" in data
    assert "series" in data
    assert len(data["series"]) > 0

def test_get_category_share(client):
    response = client.get("/api/overview/category-share")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "name" in data[0]
    assert "value" in data[0]

def test_get_demand_mesh(client):
    response = client.get("/api/overview/demand-mesh")
    assert response.status_code == 200
    data = response.json()
    assert "type" in data
    assert data["type"] == "FeatureCollection"
    assert "features" in data
