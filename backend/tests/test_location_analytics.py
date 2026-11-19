def test_get_stores(client):
    response = client.get("/api/locations/stores")
    assert response.status_code == 200
    stores = response.json()
    assert isinstance(stores, list)
    assert len(stores) > 0
    assert "name" in stores[0]
    assert "latitude" in stores[0]
    assert "longitude" in stores[0]

def test_get_competitors(client):
    response = client.get("/api/locations/competitors")
    assert response.status_code == 200
    competitors = response.json()
    assert isinstance(competitors, list)
    assert len(competitors) > 0

def test_get_transit_hubs(client):
    response = client.get("/api/locations/transit-hubs")
    assert response.status_code == 200
    hubs = response.json()
    assert isinstance(hubs, list)
    assert len(hubs) > 0

def test_get_demographics(client):
    response = client.get("/api/locations/demographics")
    assert response.status_code == 200
    data = response.json()
    assert "median_household_income" in data
