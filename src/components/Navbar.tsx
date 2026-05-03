import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const links = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/tek", label: "Featured Sounds" },
  { href: "/#upload", label: "Upload" },
  { href: "/about", label: "About" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-earth-brown/95 backdrop-blur-md border-b border-sand/20 shadow-card">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src={logo}
            alt="Lkotkote logo — hornbill silhouette with sound wave"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-savanna-gold/40"
            width={36}
            height={36}
          />
          <span className="font-display font-bold text-lg text-sand-light">Lkotkote</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm font-body text-sand-light">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-savanna-gold transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-sand-light p-2 -mr-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-sand/20 bg-earth-brown/95 backdrop-blur-md">
          <div className="container max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3 text-sm font-body text-sand-light">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 hover:text-savanna-gold transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
