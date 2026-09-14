import { describe, expect, it } from "vitest";
import { assertOrderTransition } from "./order-state.js";

describe("order state machine", () => {
  it("allows configured forward transitions", () => {
    expect(() => assertOrderTransition("PENDING", "CONFIRMED")).not.toThrow();
    expect(() => assertOrderTransition("SHIPPED", "DELIVERED")).not.toThrow();
  });

  it("rejects invalid transitions", () => {
    expect(() => assertOrderTransition("PENDING", "SHIPPED")).toThrow("Invalid order status transition");
    expect(() => assertOrderTransition("REFUNDED", "DELIVERED")).toThrow("Invalid order status transition");
  });
});
