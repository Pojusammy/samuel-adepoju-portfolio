import Link from "next/link";

import { contactContent, socialLinks } from "@/data/site";

export function ContactSection() {
  return (
    <section id="contact" className="pb-24 pt-0">
      <p className="max-w-[42.5rem] text-[15px] leading-6 text-foreground-muted">
        {contactContent.intro}
      </p>
      <div className="mt-5 flex flex-wrap gap-6 text-[14px] leading-5 text-foreground-muted">
        {socialLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="hover:text-foreground"
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
