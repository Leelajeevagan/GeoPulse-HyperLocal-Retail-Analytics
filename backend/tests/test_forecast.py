def test_get_store_forecast(client):
    response = client.get("/api/forecast/7day/1")
    assert response.status_code == 200
    data = response.json()
    assert "store_id" in data
    assert data["store_id"] == 1
    assert "series" in data
    assert len(data["series"]) == 7
    pt = data["series"][0]
    assert "projected_footfall" in pt
    assert "lower_bound" in pt
    assert "upper_bound" in pt
    assert "weather_condition" in pt

def test_get_store_forecast_not_found(client):
    response = client.get("/api/forecast/7day/99999")
    assert response.status_code == 404

def test_get_network_forecast(client):
    response = client.get("/api/forecast/network")
    assert response.status_code == 200
    data = response.json()
    assert "nodes_monitored" in data
    assert "total_7day_network_footfall" in data
    assert "series" in data
    assert len(data["series"]) == 7

def test_get_cannibalization_matrix(client):
    response = client.get("/api/forecast/cannibalization")
    assert response.status_code == 200
    data = response.json()
    assert "total_store_pairs_analyzed" in data
    assert "overlapping_pairs" in data
    assert isinstance(data["overlapping_pairs"], list)
