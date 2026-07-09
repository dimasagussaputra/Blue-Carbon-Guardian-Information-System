import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TentangProgram from "@/components/landing/TentangProgram";
import Statistik from "@/components/landing/Statistik";
import PetaPreview from "@/components/landing/PetaPreview";
import MonitoringPreview from "@/components/landing/MonitoringPreview";
import BlueCarbonDetails from "@/components/landing/BlueCarbonDetails";
import PaketWisata from "@/components/landing/PaketWisata";
import Timeline from "@/components/landing/Timeline";
import Galeri from "@/components/landing/Galeri";
import FAQ from "@/components/landing/FAQ";
import Kontak from "@/components/landing/Kontak";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TentangProgram />
        <Statistik />
        <PetaPreview />
        <MonitoringPreview />
        <BlueCarbonDetails />
        <PaketWisata />
        <Timeline />
        <Galeri />
        <FAQ />
        <Kontak />
      </main>
      <Footer />
    </>
  );
}
