import logo from "@/assets/logo.png";

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-foreground/10 backdrop-blur-md border-b border-sand/10">
    <div className="container max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <img
          src={logo}
          alt="Lkotkote logo — hornbill silhouette with sound wave"
          className="w-9 h-9 rounded-full object-cover ring-2 ring-savanna-gold/40"
          width={36}
          height={36}
        />
        <span className="font-display font-bold text-lg text-sand-light">Lkotkote</span>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-sm font-body text-sand-light/70">
        <a href="/#how-it-works" className="hover:text-sand-light transition-colors">How It Works</a>
        <a href="/tek" className="hover:text-sand-light transition-colors">Samburu TEK</a>
        <a href="/#upload" className="hover:text-sand-light transition-colors">Upload</a>
      </div>
    </div>
  </nav>
);

export default Navbar;
