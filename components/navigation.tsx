"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Brand({ title }: { title: string }) {
  return (
    <Link href="/" className="brand" prefetch={false}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 30 30" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.35">
          <path d="M5 21 9.3 8l5.7 10 5.7-10L25 21M5 24h20" />
          <path d="M9.3 8h2.8l5.7 10" opacity=".55" />
        </svg>
      </span>
      <span>{title}</span>
    </Link>
  );
}

export function Header({ title, links, current }: {
  title: string;
  links: { label: string; href: string }[];
  current: string;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const refocus = useRef(true);
  const contact = current === "/contact" ? "page" : undefined;

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 62rem)");
    const resize = () => {
      if (wide.matches && dialog.current?.open) {
        refocus.current = false;
        dialog.current.close();
      }
    };
    wide.addEventListener("change", resize);
    return () => wide.removeEventListener("change", resize);
  }, []);

  useEffect(() => {
    if (dialog.current?.open) dialog.current.close();
  }, [current]);

  function closeForNavigation() {
    refocus.current = false;
    dialog.current?.close();
  }

  return (
    <header className="header" data-site-header="">
      <div className="shell header-row">
        <Brand title={title} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.filter((link) => link.href !== "/contact").map((link) => (
            <Link key={link.href} href={link.href} aria-current={link.href === current ? "page" : undefined} prefetch={false}>{link.label}</Link>
          ))}
        </nav>
        <Link href="/contact" className="button small header-contact" aria-current={contact} prefetch={false}>Get in touch</Link>
        <button
          ref={trigger}
          type="button"
          className="icon menu"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => {
            refocus.current = true;
            dialog.current?.showModal();
            setOpen(true);
          }}
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </div>
      <div className="site-progress" aria-hidden="true" />
      <dialog
        className="mobile-nav"
        id="mobile-navigation"
        aria-label="Site menu"
        ref={dialog}
        onClose={() => {
          setOpen(false);
          if (refocus.current) trigger.current?.focus();
        }}
      >
        <div className="shell mobile-nav-panel">
          <div className="mobile-nav-top">
            <span>{title}</span>
            <button className="icon" type="button" onClick={() => dialog.current?.close()} aria-label="Close menu" autoFocus>
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href} aria-current={link.href === current ? "page" : undefined} onClick={closeForNavigation} prefetch={false}>{link.label}</Link>
            ))}
          </nav>
        </div>
      </dialog>
    </header>
  );
}
