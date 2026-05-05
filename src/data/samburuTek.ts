export interface SamburuBird {
  id: number;
  commonName: string;
  scientificName: string;
  localName: string;
  prediction: string;
  category: "weather" | "omen" | "social" | "predator";
  story: string;
  localAudio?: string;
  audioCredit?: string;
}

// Source: Field notes from Samburu community elders, Northern Kenya.
// Traditional Ecological Knowledge (TEK) — bird sounds as ecological & social indicators.
export const SAMBURU_BIRDS: SamburuBird[] = [
  {
    id: 1,
    commonName: "White-bellied Go-away-bird",
    scientificName: "Crinifer leucogaster",
    localName: "Lkuak",
    prediction: "Danger",
    category: "omen",
    story:
      "Its harsh nasal call is a sentinel for the herd — when Lkuak shouts from the acacia, warriors check the bush for predators or strangers approaching the manyatta.",
  },
  {
    id: 2,
    commonName: "Lesser Masked Weaver",
    scientificName: "Ploceus intermedius",
    localName: "Mairii",
    prediction: "Raining",
    category: "weather",
    story:
      "When colonies of Mairii start weaving frantically and chattering at dawn, elders prepare livestock — the rains are within days.",
  },
  {
    id: 3,
    commonName: "Verreaux's Eagle-Owl",
    scientificName: "Ketupa lacteus",
    localName: "Lugut",
    prediction: "Bad omen",
    category: "omen",
    story:
      "The deep hoot of Lugut near a homestead is feared. Elders perform cleansing rituals; children are kept indoors until the bird departs.",
  },
  {
    id: 4,
    commonName: "Pied Cuckoo",
    scientificName: "Clamator jacobinus",
    localName: "Chupaa",
    prediction: "Rains",
    category: "weather",
    story:
      "Chupaa migrates ahead of the monsoon. Its arrival call is the most reliable herald of the long rains across Samburu pastures.",
  },
  {
    id: 5,
    commonName: "Marabou Stork",
    scientificName: "Leptoptilos crumenifer",
    localName: "Naraneho",
    prediction: "Bad omen or death",
    category: "omen",
    story:
      "Circling Naraneho over a settlement is read as a sign of impending loss — historically a cue to check on the sick and elderly.",
  },
  {
    id: 6,
    commonName: "Vulturine Guineafowl",
    scientificName: "Acryllium vulturinum",
    localName: "Lkeresire",
    prediction: "Unity",
    category: "social",
    story:
      "Lkeresire moves in tight flocks. Their synchronised calls are invoked in proverbs that teach children the strength of community.",
  },
  {
    id: 7,
    commonName: "Mourning Collared Dove",
    scientificName: "Streptopelia decipiens",
    localName: "Nkutukuruk",
    prediction: "Death",
    category: "omen",
    story:
      "The mournful coo of Nkutukuruk at dusk near a home is a traditional sign of grief approaching the family.",
  },
  {
    id: 8,
    commonName: "Secretarybird",
    scientificName: "Sagittarius serpentarius",
    localName: "Lmamura",
    prediction: "Braveness",
    category: "social",
    story:
      "Lmamura stamps snakes to death on open ground. Warriors invoke its name as a symbol of courage during initiation.",
  },
  {
    id: 9,
    commonName: "Bateleur",
    scientificName: "Terathopius ecaudatus",
    localName: "Lmagiro",
    prediction: "Killer / bird of prey",
    category: "predator",
    story:
      "Lmagiro's silent glide overhead alerts herders to keep newborn lambs and kids close — it is a swift hunter of small livestock.",
  },
  {
    id: 10,
    commonName: "Red-winged Starling",
    scientificName: "Onychognathus morio",
    localName: "Surpelei",
    prediction: "Companion of homes",
    category: "social",
    story:
      "Surpelei often nests on cliffs and rooftops. Its whistling song is welcomed — a sign the homestead is alive and well.",
  },
  {
    id: 11,
    commonName: "Magpie Starling",
    scientificName: "Speculipastor bicolor",
    localName: "Surpelei entim",
    prediction: "Forest companion",
    category: "social",
    story:
      "The 'forest Surpelei' moves in nomadic flocks. Its appearance signals fruiting trees — gatherers follow it to wild figs.",
  },
  {
    id: 12,
    commonName: "Bristle-crowned Starling",
    scientificName: "Onychognathus salvadorii",
    localName: "Surpelei elkees",
    prediction: "Cliff dweller",
    category: "social",
    story:
      "Calls echoing from rocky escarpments mark traditional water sources — herders use them as audible landmarks.",
  },
  {
    id: 13,
    commonName: "Gabar Goshawk",
    scientificName: "Micronisus gabar",
    localName: "Nkoilepo",
    prediction: "Chick eater",
    category: "predator",
    story:
      "When Nkoilepo calls nearby, women rush to gather chickens — it raids domestic poultry with surgical speed.",
  },
  {
    id: 14,
    commonName: "Wire-tailed Swallow",
    scientificName: "Hirundo smithii",
    localName: "Nkaiverei",
    prediction: "Raining season",
    category: "weather",
    story:
      "Low-flying Nkaiverei chasing insects above the riverbeds tells elders the wet season is fully open — time to move herds.",
  },
];
