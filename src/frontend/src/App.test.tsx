// @vitest-environment jsdom

import App from "@/App";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

describe("application accessibility", () => {
  it("has no automated accessibility violations", async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
