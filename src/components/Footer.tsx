import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="py-12 border-t border-border">
    <div className="container max-w-6xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-2.5">
        <img
          src={logo}
          alt="Lkotkote logo"
          className="w-10 h-10 rounded-full object-cover ring-2 ring-savanna-gold/40"
          width={40}
          height={40}
        />
        <span className="font-display font-bold text-lg text-foreground">Lkotkote</span>
      </div>
      <p className="text-sm font-body text-muted-foreground max-w-2xl">
        © 2026 Lkotkote — Bridging bioacoustics and Traditional Ecological Knowledge for climate resilience.
      </p>
    </div>
  </footer>
);

export default Footer;
