"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { contactContent, socialLinks } from "@/data/site";

export function ContactSection() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      id="contact"
      className="pb-24 pt-0"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-8% 0px" }}
      variants={
        reduceMotion
          ? undefined
          : {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }
      }
    >
      <motion.p
        className="max-w-[42.5rem] text-[15px] leading-6 text-foreground-muted"
        variants={
          reduceMotion
            ? undefined
            : {
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }
        }
        transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
      >
        {contactContent.intro}
      </motion.p>
      <motion.div
        className="mt-5 flex flex-wrap gap-6 text-[14px] leading-5 text-foreground-muted"
        variants={
          reduceMotion
            ? undefined
            : {
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.045,
                    delayChildren: 0.02,
                  },
                },
              }
        }
      >
        {socialLinks.map((link) => (
          <motion.div
            key={link.label}
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }
            }
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={link.href}
              className="transition-[color,transform] duration-300 hover:translate-x-[1px] hover:text-foreground"
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            >
              {link.label}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
