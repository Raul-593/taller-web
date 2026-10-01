import { Navbar } from "@/componentes/(publico)/landing/Navbar";
import { Hero } from "@/componentes/(publico)/landing/Hero";
import { About } from "@/componentes/(publico)/landing/About";
import { Services } from "@/componentes/(publico)/landing/Services";
import { Contact } from "@/componentes/(publico)/landing/Contact";
import { Footer } from "@/componentes/(publico)/landing/Footer";
import { Analytics } from "@vercel/analytics/next";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col scroll-smooth selection:bg-primary selection:text-primary-foreground">
      <Analytics />
      <Navbar />
       <main className="flex-1">
        <Hero />
        <About />
        <Services />
        <Contact />
       </main>
      <Footer />
    </div>
  );
}
