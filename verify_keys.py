import requests
import json

keys = {
  "Crinifer leucogaster": 11260662,
  "Ploceus intermedius": 2494014,
  "Ketupa lacteus": 12274006,
  "Clamator jacobinus": 2496468,
  "Leptoptilos crumenifer": 9772663,
  "Acryllium vulturinum": 2473339,
  "Streptopelia decipiens": 2495674,
  "Sagittarius serpentarius": 5229409,
  "Terathopius ecaudatus": 2480377,
  "Onychognathus morio": 5230739,
  "Speculipastor bicolor": 2489091,
  "Onychognathus salvadorii": 5230741,
  "Micronisus gabar": 5788495,
  "Hirundo smithii": 5230801,
  "Gyps africanus": 9487001,
  "Gyps rueppelli": 2480384,
  "Necrosyrtes monachus": 2480715
}

verification = {}
for name, key in keys.items():
    res = requests.get(f"https://api.gbif.org/v1/species/{key}")
    data = res.json()
    accepted_key = data.get("acceptedUsageKey", key)
    
    # Check occurrence count
    occ_res = requests.get(f"https://api.gbif.org/v1/occurrence/count?taxonKey={accepted_key}")
    count = occ_res.text
    
    verification[name] = {
        "key": key,
        "acceptedKey": accepted_key,
        "scientificName": data.get("scientificName"),
        "count": count
    }

print(json.dumps(verification, indent=2))
