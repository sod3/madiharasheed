"use client";

import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Row } from "@/db";
import { href, text } from "@/lib/domain";

function distance(touches: React.TouchList) {
  return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
}

export function Gallery({ items }: { items: Row[] }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const current = items[index];

  useEffect(() => {
    const viewport = stage.current;
    if (!viewport) return;
    viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
    viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
  }, [index, zoom]);

  function step(delta: number) {
    setZoom(1);
    setIndex((currentIndex) => (currentIndex + delta + items.length) % items.length);
  }

  if (!current) return null;

  return (
    <>
      <div className="credential-grid">
        {items.map((item, i) => (
          <figure className="credential" key={item.id}>
            <button
              className="credential-thumb"
              type="button"
              aria-haspopup="dialog"
              aria-label={"View " + text(item, "title")}
              onClick={(event) => {
                trigger.current = event.currentTarget;
                setOpen(true);
                setIndex(i);
                setZoom(1);
                dialog.current?.showModal();
              }}
            >
              {href(item.image) ? (
                // The certificate is served from the original, pre-optimized media.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={href(item.thumbnail) || href(item.image)} alt="" loading="lazy" decoding="async" />
              ) : <span className="placeholder">Play video</span>}
              <span className="credential-enlarge" aria-hidden="true"><Maximize2 size={17} /></span>
            </button>
            <figcaption>
              {item.category && <p className="eyebrow">{item.category}</p>}
              <h3>{item.title}</h3>
              {(item.issuer || item.date_label) && <p className="meta">{[item.issuer, item.date_label].filter(Boolean).join(" · ")}</p>}
            </figcaption>
          </figure>
        ))}
      </div>
      <dialog
        className="credential-dialog"
        ref={dialog}
        aria-label="Certificate and media viewer"
        onClose={() => {
          setOpen(false);
          setZoom(1);
          trigger.current?.focus();
        }}
        onKeyDown={(event) => {
          if (items.length < 2 || zoom > 1 || event.target instanceof HTMLVideoElement) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            step(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        <div className="credential-toolbar">
          <div className="credential-current" aria-live="polite">
            <strong>{current.title}</strong>
            <p>{index + 1} of {items.length}</p>
          </div>
          <div className="credential-controls">
            {!current.video && (
              <button className="icon" type="button" aria-label={zoom > 1 ? "Reset zoom" : "Zoom in"} onClick={() => setZoom(zoom > 1 ? 1 : 2)}>
                {zoom > 1 ? <ZoomOut size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}
              </button>
            )}
            <button className="icon" aria-label="Close viewer" type="button" onClick={() => dialog.current?.close()} autoFocus><X size={22} aria-hidden="true" /></button>
          </div>
        </div>
        <div
          className="credential-stage"
          ref={stage}
          data-zoomed={zoom > 1}
          style={{ "--zoom": zoom } as React.CSSProperties}
          onDoubleClick={() => { if (!current.video) setZoom(zoom > 1 ? 1 : 2); }}
          onTouchStart={(event) => {
            if (current.video) return;
            if (event.touches.length === 2) {
              pinch.current = { distance: distance(event.touches), zoom };
              touch.current = null;
            } else if (event.touches.length === 1 && zoom === 1 && !pinch.current) {
              const { clientX, clientY } = event.touches[0];
              touch.current = { x: clientX, y: clientY };
            }
          }}
          onTouchMove={(event) => {
            if (pinch.current && event.touches.length === 2) {
              const factor = distance(event.touches) / Math.max(pinch.current.distance, 1);
              setZoom(Math.max(1, Math.min(3, factor * pinch.current.zoom)));
            }
          }}
          onTouchEnd={(event) => {
            if (event.touches.length) return;
            const start = touch.current;
            const end = event.changedTouches[0];
            if (items.length > 1 && start && end) {
              const dx = end.clientX - start.x;
              if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(end.clientY - start.y)) step(dx > 0 ? -1 : 1);
            }
            touch.current = null;
            pinch.current = null;
          }}
          onTouchCancel={() => {
            touch.current = null;
            pinch.current = null;
          }}
        >
          {open && <div className="credential-media" key={current.id}>
            {current.video ? (
              <video src={href(current.video)} poster={href(current.image)} controls playsInline preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={href(current.image)} alt={text(current, "alt") || text(current, "title")} />
            )}
          </div>}
        </div>
        <div className="credential-caption">
          <div className="credential-context">
            {(current.issuer || current.date_label) && <p><strong>{[current.issuer, current.date_label].filter(Boolean).join(" · ")}</strong></p>}
            {current.body && <p>{current.body}</p>}
          </div>
          {items.length > 1 && (
            <div className="credential-controls">
              <button className="icon" type="button" aria-label="Previous certificate" onClick={() => step(-1)}><ChevronLeft size={21} aria-hidden="true" /></button>
              <button className="icon" type="button" aria-label="Next certificate" onClick={() => step(1)}><ChevronRight size={21} aria-hidden="true" /></button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
