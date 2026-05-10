import { GitFork, Mail, Bird, Globe, Sparkles, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navbar />
      <main className="container max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <header className="mb-10">
          <p className="font-body text-sm uppercase tracking-widest text-savanna-amber mb-3">About</p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground leading-tight">
            Lkotkote: Turning Bird Voices into Climate Intelligence through Indigenous Knowledge
          </h1>
          <p className="mt-5 font-body text-base sm:text-lg text-muted-foreground leading-relaxed">
            Lkotkote is a web-based platform that transforms bird sound recordings into actionable climate and
            ecological insights by combining AI-powered bioacoustic analysis with Traditional Ecological Knowledge
            (TEK). Named after the Samburu word for the Eastern Yellow-billed Hornbill — a charismatic and culturally
            recognized species — Lkotkote symbolizes the deep connection between nature, sound, and seasonal change.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">What Lkotkote Does</h2>
          <p className="font-body text-muted-foreground mb-4">Lkotkote bridges three powerful systems:</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, title: "AI Detection", desc: "Powered by BirdNET-Analyzer." },
              { icon: Bird, title: "Indigenous TEK", desc: "Local interpretation of bird signals." },
              { icon: Globe, title: "GBIF Integration", desc: "Global biodiversity infrastructure." },
            ].map((it) => (
              <Card key={it.title} className="border-sand bg-card/80">
                <CardContent className="p-5">
                  <it.icon className="w-6 h-6 text-savanna-amber mb-3" />
                  <h3 className="font-display text-lg font-semibold mb-1">{it.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{it.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-5 font-body text-muted-foreground">
            The platform converts raw bird sound data into structured, standardized, and culturally enriched datasets
            that reveal seasonal patterns, climate signals, and ecological changes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">How It Works</h2>
          <ol className="space-y-5 font-body text-muted-foreground">
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">1. Audio Input</h3>
              <p>
                Users upload bird recordings collected from AudioMoths, mobile phones, or field recorders. Recordings
                can come from Indigenous communities, researchers, or conservation teams.
              </p>
            </li>
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">2. AI Bird Detection</h3>
              <p>
                Audio is processed by BirdNET-Analyzer to identify species, assign confidence scores, and timestamp
                detections — producing structured species detection data.
              </p>
            </li>
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">
                3. TEK Annotation Layer (Core Innovation)
              </h3>
              <p>
                Community members enrich detections with local species names (e.g. <em>Lkotkote</em>), seasonal
                indicators ("signals onset of rains"), behavioral insights, and cultural meaning — transforming data
                into context-rich ecological intelligence.
              </p>
            </li>
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">
                4. Seasonal & Climate Signal Engine
              </h3>
              <p>
                Combined AI + TEK data yields seasonal phase indicators (dry season, rain onset), phenological signals
                (fruiting, migration), and climate-related patterns over time.
              </p>
            </li>
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">5. Validation & Visualization</h3>
              <p>Preview detections on a map, review seasonal trends, and validate species and TEK entries collaboratively.</p>
            </li>
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">6. GBIF-Ready Data Export</h3>
              <p>
                All data is automatically converted into Darwin Core–compliant datasets (occurrence, event, and
                measurement data) ready for publishing through GBIF.
              </p>
            </li>
            <li>
              <h3 className="font-display text-lg font-semibold text-foreground">7. Indigenous Data Governance</h3>
              <p>
                Lkotkote respects Indigenous data sovereignty: communities define access levels (public, restricted,
                private), attach Traditional Knowledge labels via Local Contexts, and control how knowledge is shared.
              </p>
            </li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">Why Lkotkote Matters</h2>
          <Card className="border-sand bg-card/80">
            <CardContent className="p-6 space-y-3 font-body text-muted-foreground">
              <p>Most biodiversity systems tell us <strong>what species are present</strong>.</p>
              <p className="text-foreground">Lkotkote reveals <strong>what those species mean</strong>.</p>
              <ul className="list-disc list-inside space-y-1 pt-2">
                <li>Enhances biodiversity datasets with cultural and ecological depth</li>
                <li>Generates locally grounded climate indicators</li>
                <li>Empowers Indigenous communities as data owners and knowledge leaders</li>
                <li>Contributes to global science without losing local context</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">Vision</h2>
          <p className="font-body text-muted-foreground italic">
            Lkotkote envisions a future where bird calls are not just sounds — but signals of seasonal change, climate
            patterns, and living knowledge systems. It is more than a tool: it is a bridge between Indigenous wisdom,
            artificial intelligence, and global biodiversity science.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground mb-4">Get in Touch</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="https://github.com/mburadee/lkotkote-sound-wisdom"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border-sand bg-card/80 hover:border-savanna-amber transition-colors h-full">
                <CardContent className="p-5 flex items-start gap-3">
                  <GitFork className="w-6 h-6 text-foreground mt-1" />
                  <div>
                    <h3 className="font-display text-lg font-semibold">GitHub Repository</h3>
                    <p className="font-body text-sm text-muted-foreground break-all">
                      github.com/mburadee/lkotkote-sound-wisdom
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
            <a href="mailto:douglas.mbura@gmail.com" className="group">
              <Card className="border-sand bg-card/80 hover:border-savanna-amber transition-colors h-full">
                <CardContent className="p-5 flex items-start gap-3">
                  <Mail className="w-6 h-6 text-foreground mt-1" />
                  <div>
                    <h3 className="font-display text-lg font-semibold">Contact</h3>
                    <p className="font-body text-sm text-muted-foreground break-all">douglas.mbura@gmail.com</p>
                    <p className="font-body text-sm text-muted-foreground break-all">cc. nyaburi55@gmail.com</p>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4" />
            <span>Built with respect for Indigenous data sovereignty.</span>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
