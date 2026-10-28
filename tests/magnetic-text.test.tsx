import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MagneticText } from "../src/components/ui/morphing-cursor";

describe("MagneticText Component", () => {
  it("renders base accessible text correctly to HTML", () => {
    const html = renderToStaticMarkup(
      <MagneticText text="Every patient has a story." hoverText="Every detail matters." />
    );
    expect(html).toContain("Every patient has a story.");
    expect(html).toContain("Every detail matters.");
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Every patient has a story.. Hover or focus to reveal: Every detail matters."');
  });

  it("marks hover decoration as aria-hidden for accessibility", () => {
    const html = renderToStaticMarkup(
      <MagneticText text="Primary Text" hoverText="Hover Text" />
    );
    expect(html).toContain('aria-hidden="true"');
  });

  it("applies custom className cleanly", () => {
    const html = renderToStaticMarkup(
      <MagneticText text="Sample" hoverText="Alternate" className="custom-editorial-class" />
    );
    expect(html).toContain("custom-editorial-class");
  });
});
