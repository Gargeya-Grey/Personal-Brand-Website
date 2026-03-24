export function Footer() {
  return (
    <footer className="w-full py-16 bg-surface-container-low border-t border-outline-variant/20 mt-32">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-screen-2xl mx-auto space-y-6 md:space-y-0">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-headline font-bold text-primary text-lg">Gargeya Sharma</span>
          <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            © {new Date().getFullYear()} Architectural Intelligence. Built for precision.
          </span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {['Twitter', 'GitHub', 'LinkedIn', 'RSS'].map((link) => (
            <a 
              key={link}
              href="#" 
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-accent transition-colors duration-300"
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
