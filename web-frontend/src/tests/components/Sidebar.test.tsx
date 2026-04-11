import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";

const renderSidebar = (props: { isOpen?: boolean; isMobile?: boolean } = {}) =>
  render(
    <MemoryRouter>
      <Sidebar
        isOpen={props.isOpen ?? true}
        isMobile={props.isMobile ?? false}
        onClose={vi.fn()}
      />
    </MemoryRouter>,
  );

describe("Sidebar", () => {
  it("renders nav links when open on desktop", () => {
    renderSidebar({ isOpen: true, isMobile: false });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Wallet")).toBeInTheDocument();
    expect(screen.getByText("Cards")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders finance section group title", () => {
    renderSidebar();
    expect(screen.getByText("Finance")).toBeInTheDocument();
  });

  it("renders intelligence section", () => {
    renderSidebar();
    expect(screen.getByText("AI Assistant")).toBeInTheDocument();
    expect(screen.getByText("Fraud Alerts")).toBeInTheDocument();
  });

  it("renders fraud badge", () => {
    renderSidebar();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked on mobile", () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} isMobile={true} onClose={onClose} />
      </MemoryRouter>,
    );
    const backdrop = document.querySelector(".fixed.inset-0");
    if (backdrop) fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows close button on mobile", () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} isMobile={true} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Close sidebar")).toBeInTheDocument();
  });

  it("hides sidebar when closed on desktop (w-0)", () => {
    renderSidebar({ isOpen: false, isMobile: false });
    const aside = document.querySelector("aside");
    expect(aside?.className).toContain("w-0");
  });
});
