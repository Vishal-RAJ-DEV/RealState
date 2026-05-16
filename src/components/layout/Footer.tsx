'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <footer className="bg-charcoal text-cream relative overflow-hidden">
      <motion.div
        initial={{ rotateX: -30, opacity: 0 }}
        whileInView={{ rotateX: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="py-16 lg:py-24"
        style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <h2
            className="text-center font-sans font-black text-6xl sm:text-8xl lg:text-[10rem] leading-none tracking-tighter text-cream select-none"
            style={{
              transform: 'translateY(-30px)',
              textShadow: `
                1px 1px 0 #d1cec6,
                0px -1px 0 #757066,
                0px -2px 0 #757066,
                0px -3px 0 #757066,
                0px -4px 0 #757066,
                0px -5px 0 #757066,
                0px -6px 0 #757066,
                0px -7px 0 #757066,
                0px -8px 0 #757066,
                0px -9px 0 #757066,
                0px -10px 0 #757066,
                0px -11px 0 #757066,
                0px -12px 0 #757066,
                0px -13px 0 #757066,
                0px -14px 0 #757066,
                0px -15px 0 #757066,
                0px -16px 0 #757066,
                0px -17px 0 #757066,
                0px -18px 0 #757066,
                0px -19px 0 #757066,
                0px -20px 0 #757066,
                0px -21px 0 #757066,
                0px -22px 0 #757066,
                0px -23px 0 #757066,
                0px -24px 0 #757066,
                0px -25px 0 #757066,
                0px -26px 0 #757066,
                0px -27px 0 #757066,
                0px -28px 0 #757066,
                0px -29px 0 #757066,
                0px -30px 0 #757066,
                0px -31px 0 #555248,
                0px -32px 3px #555248
              `,
            }}
          >
            PROP FINDER
          </h2>
        </div>
      </motion.div>

      <div className="border-t border-cream/10">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <h4 className="font-serif text-lg mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-cream/60 hover:text-cream transition-colors">About</Link></li>
                <li><Link href="/careers" className="text-sm text-cream/60 hover:text-cream transition-colors">Careers</Link></li>
                <li><Link href="/press" className="text-sm text-cream/60 hover:text-cream transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg mb-4">Properties</h4>
              <ul className="space-y-2">
                <li><Link href="/search?type=Buy" className="text-sm text-cream/60 hover:text-cream transition-colors">Buy</Link></li>
                <li><Link href="/search?type=Rent" className="text-sm text-cream/60 hover:text-cream transition-colors">Rent</Link></li>
                <li><Link href="/post" className="text-sm text-cream/60 hover:text-cream transition-colors">Sell</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-sm text-cream/60 hover:text-cream transition-colors">Blog</Link></li>
                <li><Link href="/guides" className="text-sm text-cream/60 hover:text-cream transition-colors">Guides</Link></li>
                <li><Link href="/help" className="text-sm text-cream/60 hover:text-cream transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-lg mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-cream/60 hover:text-cream transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="text-sm text-cream/60 hover:text-cream transition-colors">Privacy</Link></li>
                <li><Link href="/cookies" className="text-sm text-cream/60 hover:text-cream transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-cream/40">
              &copy; {new Date().getFullYear()} PropFinder. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-cream/40 hover:text-cream transition-colors">Instagram</a>
              <a href="#" className="text-sm text-cream/40 hover:text-cream transition-colors">Twitter</a>
              <a href="#" className="text-sm text-cream/40 hover:text-cream transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
