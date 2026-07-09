import {
  MANGROVE_TYPES,
  CARBON_FRACTION,
  CO2_TO_CARBON_RATIO,
  IDR_RATE,
  REFERENCES,
  type MangroveTypeConfig,
} from "./constants";
import type {
  BlueCarbonInput,
  BlueCarbonResult,
  CalculationBreakdown,
} from "./types";

export function calculateBlueCarbon(input: BlueCarbonInput): BlueCarbonResult {
  const jenis = MANGROVE_TYPES[input.mangrove_type] as MangroveTypeConfig | undefined;
  if (!jenis) throw new Error(`Jenis mangrove "${input.mangrove_type}" tidak dikenal`);

  const areaHa = input.area_ha;
  const density = input.density_per_ha ?? jenis.densityDefault;
  const dbh = input.avg_dbh_cm;
  const price = input.carbon_price;
  let biomassaKg: number;
  let metode: string;
  const breakdown: CalculationBreakdown[] = [];
  const refs: Set<string> = new Set();

  if (dbh && dbh > 0) {
    metode = "allometric";
    const agb = 0.251 * jenis.woodDensity * Math.pow(dbh, 2.46);
    const bgb = 0.199 * Math.pow(jenis.woodDensity, 0.899) * Math.pow(dbh, 2.22);
    const perPohon = agb + bgb;
    const totalPohon = areaHa * density;
    biomassaKg = perPohon * totalPohon;

    breakdown.push({
      step: 1,
      label: "Biomassa per Pohon (AGB + BGB)",
      formula: `AGB = 0,251 × ${jenis.woodDensity} × ${dbh}^2,46 = ${agb.toFixed(2)} kg`,
      nilai: (agb + bgb).toFixed(2),
      satuam: "kg/pohon",
      sumber: "Komiyama et al. (2008)",
    });
    breakdown.push({
      step: 2,
      label: "Total Pohon",
      formula: `${areaHa} ha × ${density} pohon/ha`,
      nilai: totalPohon.toFixed(0),
      satuam: "pohon",
      sumber: "-",
    });
    breakdown.push({
      step: 3,
      label: "Total Biomassa",
      formula: `${(agb + bgb).toFixed(2)} kg × ${totalPohon.toFixed(0)} pohon`,
      nilai: biomassaKg.toFixed(2),
      satuam: "kg",
      sumber: "Komiyama et al. (2008)",
    });
    refs.add("Komiyama et al. (2008)");
  } else {
    metode = "ipcc_tier1";
    const biomassaPerHa = jenis.biomassPerHa * 1000;
    biomassaKg = areaHa * biomassaPerHa;

    breakdown.push({
      step: 1,
      label: "Estimasi Biomassa Total",
      formula: `${areaHa} ha × ${jenis.biomassPerHa} ton/ha × 1000`,
      nilai: biomassaKg.toFixed(2),
      satuam: "kg",
      sumber: "IPCC (2013) Wetlands Supplement",
    });
    refs.add("IPCC (2013)");
  }

  const karbonKg = biomassaKg * CARBON_FRACTION;
  const co2Kg = karbonKg * CO2_TO_CARBON_RATIO;
  const nilaiEkonomi = (co2Kg / 1000) * price;
  const nilaiEkonomiIdr = nilaiEkonomi * IDR_RATE;

  const stepOffset = dbh && dbh > 0 ? 3 : 1;
  breakdown.push({
    step: stepOffset + 1,
    label: "Konversi ke Karbon",
    formula: `${biomassaKg.toFixed(2)} kg × ${CARBON_FRACTION}`,
    nilai: karbonKg.toFixed(2),
    satuam: "kg C",
    sumber: "IPCC (2013)",
  });
  refs.add("IPCC (2013)");

  breakdown.push({
    step: stepOffset + 2,
    label: "Konversi ke CO₂ Ekuivalen",
    formula: `${karbonKg.toFixed(2)} kg C × ${CO2_TO_CARBON_RATIO}`,
    nilai: co2Kg.toFixed(2),
    satuam: "kg CO₂e",
    sumber: "IPCC (2013)",
  });

  breakdown.push({
    step: stepOffset + 3,
    label: "Nilai Ekonomi Karbon",
    formula: `${(co2Kg / 1000).toFixed(2)} ton CO₂e × $${price}`,
    nilai: `$${nilaiEkonomi.toFixed(2)}`,
    satuam: "USD",
    sumber: "World Bank Carbon Pricing (2024)",
  });

  breakdown.push({
    step: stepOffset + 4,
    label: "Nilai Ekonomi (IDR)",
    formula: `$${nilaiEkonomi.toFixed(2)} × Rp${IDR_RATE.toLocaleString("id-ID")}`,
    nilai: `Rp${nilaiEkonomiIdr.toLocaleString("id-ID", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
    satuam: "IDR",
    sumber: "Kurs tengah BI",
  });

  refs.add("World Bank Carbon Pricing (2024)");

  const referensi = REFERENCES.filter((r) =>
    Array.from(refs).some((s) => r.citation.includes(s.split("(")[0].trim()))
  ).map((r) => r.citation);

  return {
    area_ha: areaHa,
    mangrove_type: input.mangrove_type,
    mangrove_label: jenis.label,
    density_per_ha: density,
    avg_dbh_cm: dbh ?? null,
    carbon_price: price,
    biomassa_kg: Math.round(biomassaKg * 100) / 100,
    biomassa_tons: Math.round((biomassaKg / 1000) * 100) / 100,
    karbon_kg: Math.round(karbonKg * 100) / 100,
    karbon_tons: Math.round((karbonKg / 1000) * 100) / 100,
    co2_ekuivalen_kg: Math.round(co2Kg * 100) / 100,
    co2_ekuivalen_tons: Math.round((co2Kg / 1000) * 100) / 100,
    nilai_ekonomi: Math.round(nilaiEkonomi * 100) / 100,
    nilai_ekonomi_idr: Math.round(nilaiEkonomiIdr * 100) / 100,
    metode,
    breakdown,
    referensi: referensi.length > 0 ? referensi : Array.from(refs),
  };
}
