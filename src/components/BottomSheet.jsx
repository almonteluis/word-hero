import { useEffect, useRef, useState } from "react";
import { C, FONT } from "../constants";

export default function BottomSheet({ open, onClose, title, children }) {
  const [opened, setOpened] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) {
      setOpened(false);
      setDragY(0);
      return;
    }
    const id = requestAnimationFrame(() => setOpened(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  };
  const onTouchMove = (e) => {
    if (!dragging.current || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDragY(dy);
  };
  const onTouchEnd = () => {
    dragging.current = false;
    startY.current = null;
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const translate = opened ? dragY : 600;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || "Details"}
      style={{ position: "fixed", inset: 0, zIndex: 1000 }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.45)",
          opacity: opened ? 1 : 0,
          transition: "opacity 0.22s ease-out",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "88vh",
          background: C.surface,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          border: `3px solid ${C.ink}`,
          borderBottom: "none",
          boxShadow: `0 -4px 0 ${C.ink}, 0 -12px 40px rgba(0,0,0,0.15)`,
          transform: `translateY(${translate}px)`,
          transition: dragging.current
            ? "none"
            : "transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{
            padding: "10px 0 6px",
            cursor: "grab",
            touchAction: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 5,
              background: `${C.ink}40`,
              borderRadius: 3,
              margin: "0 auto",
            }}
          />
        </div>
        {title && (
          <div
            style={{
              padding: "4px 20px 12px",
              fontFamily: FONT,
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              flexShrink: 0,
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "0 20px 24px",
            paddingBottom: "max(24px, env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
