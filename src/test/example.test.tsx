import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "./utils";

// Example React component for testing
const ExampleButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} type="button">
    Click me
  </button>
);

describe("Example Test Suite", () => {
  it("should demonstrate basic React component testing", () => {
    // Arrange
    const mockClick = vi.fn();

    // Act
    render(<ExampleButton onClick={mockClick} />);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    // Assert
    expect(button).toBeInTheDocument();
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it("should demonstrate async testing patterns", async () => {
    // Arrange
    const AsyncComponent = () => {
      const [loading, setLoading] = React.useState(true);

      React.useEffect(() => {
        setTimeout(() => setLoading(false), 100);
      }, []);

      return loading ? <div>Loading...</div> : <div>Loaded!</div>;
    };

    // Act
    render(<AsyncComponent />);

    // Assert - initial state
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Assert - after async operation
    expect(await screen.findByText("Loaded!")).toBeInTheDocument();
  });

  it("should demonstrate mock patterns", () => {
    // Arrange
    const mockFunction = vi.fn().mockReturnValueOnce("first call").mockReturnValueOnce("second call");

    // Act & Assert
    expect(mockFunction()).toBe("first call");
    expect(mockFunction()).toBe("second call");
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });
});
