import requests
import json

species_list = [
    "Crinifer leucogaster",
    "Ploceus intermedius",
    "Ketupa lacteus",
    "Clamator jacobinus",
    "Leptoptilos crumenifer",
    "Acryllium vulturinum",
    "Streptopelia decipiens",
    "Sagittarius serpentarius",
    "Terathopius ecaudatus",
    "Onychognathus morio",
    "Speculipastor bicolor",
    "Onychognathus salvadorii",
    "Micronisus gabar",
    "Hirundo smithii",
    "Gyps africanus",
    "Gyps rueppelli",
    "Necrosyrtes monachus"
]

results = {}
for name in species_list:
    response = requests.get(f"https://api.gbif.org/v1/species/match?name={name}")
    if response.status_code == 200:
        data = response.json()
        results[name] = data.get("usageKey")
    else:
        results[name] = None

print(json.dumps(results, indent=2))
