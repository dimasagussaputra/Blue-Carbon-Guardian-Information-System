export interface MangroveTypeConfig {
  label: string;
  woodDensity: number;
  biomassPerHa: number;
  densityDefault: number;
  references: string[];
}

export const MANGROVE_TYPES: Record<string, MangroveTypeConfig> = {
  rhizophora_mucronata: {
    label: "Rhizophora mucronata",
    woodDensity: 0.84,
    biomassPerHa: 185.2,
    densityDefault: 1500,
    references: ["Komiyama et al. (2008)", "IPCC (2013)"],
  },
  avicennia_marina: {
    label: "Avicennia marina",
    woodDensity: 0.73,
    biomassPerHa: 145.8,
    densityDefault: 1200,
    references: ["Komiyama et al. (2008)", "IPCC (2013)"],
  },
  sonneratia_alba: {
    label: "Sonneratia alba",
    woodDensity: 0.72,
    biomassPerHa: 160.5,
    densityDefault: 1000,
    references: ["Komiyama et al. (2008)", "IPCC (2013)"],
  },
  rhizophora_apiculata: {
    label: "Rhizophora apiculata",
    woodDensity: 0.86,
    biomassPerHa: 190.3,
    densityDefault: 1600,
    references: ["Komiyama et al. (2008)", "IPCC (2013)"],
  },
  bruguiera_gymnorhiza: {
    label: "Bruguiera gymnorhiza",
    woodDensity: 0.82,
    biomassPerHa: 170.1,
    densityDefault: 1300,
    references: ["Komiyama et al. (2008)", "IPCC (2013)"],
  },
};

export const CARBON_FRACTION = 0.47;
export const CO2_TO_CARBON_RATIO = 3.67;
export const DEFAULT_CARBON_PRICE = 10;
export const IDR_RATE = 16500;

export const REFERENCES = [
  {
    id: 1,
    citation:
      "IPCC (2013). 2013 Supplement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories: Wetlands. IPCC, Switzerland.",
    url: "https://www.ipcc.ch/publication/2013-supplement-to-the-2006-ipcc-guidelines-for-national-greenhouse-gas-inventories-wetlands/",
  },
  {
    id: 2,
    citation:
      "Komiyama, A., Ong, J.E. & Poungparn, S. (2008). Allometry, biomass, and productivity of mangrove forests: A review. Aquatic Botany, 89(2), 128-137.",
    url: "https://doi.org/10.1016/j.aquabot.2007.12.006",
  },
  {
    id: 3,
    citation:
      "World Bank (2024). State and Trends of Carbon Pricing 2024. Washington, DC: World Bank.",
    url: "https://openknowledge.worldbank.org/handle/10986/41544",
  },
  {
    id: 4,
    citation:
      "Donato, D.C. et al. (2011). Mangroves among the most carbon-rich forests in the tropics. Nature Geoscience, 4, 293-297.",
    url: "https://doi.org/10.1038/ngeo1123",
  },
  {
    id: 5,
    citation:
      "Alongi, D.M. (2014). Carbon cycling and storage in mangrove forests. Annual Review of Marine Science, 6, 195-219.",
    url: "https://doi.org/10.1146/annurev-marine-010213-135020",
  },
];
