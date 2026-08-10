import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("basic delay behavior", () => {
    test("invokes the callback once after the specified delay", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced("arg1", 42);

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(99);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("arg1", 42);
    });

    test("accepts custom delay values", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 250);

      debounced();
      vi.advanceTimersByTime(249);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("call coalescing", () => {
    test("coalesces rapid successive calls into a single execution", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced(1);
      vi.advanceTimersByTime(50);
      debounced(2);
      vi.advanceTimersByTime(50);
      debounced(3);
      vi.advanceTimersByTime(50);
      debounced(4);

      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("passes only the latest arguments to the callback", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced("first");
      vi.advanceTimersByTime(50);
      debounced("second");
      vi.advanceTimersByTime(50);
      debounced("third");

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("third");
    });

    test("resets the delay on each subsequent call", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      // Call repeatedly right before the delay elapses to keep resetting it
      for (let i = 0; i < 5; i++) {
        debounced(i);
        vi.advanceTimersByTime(90);
      }

      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(4);
    });
  });

  describe("cancel", () => {
    test("prevents a pending debounced execution from running", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced();
      debounced.cancel();

      vi.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();
    });

    test("allows future calls after cancellation", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      debounced("first");
      debounced.cancel();
      vi.advanceTimersByTime(200);
      expect(callback).not.toHaveBeenCalled();

      debounced("second");
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("second");
    });

    test("is safe to call when no timer is pending", () => {
      const callback = vi.fn();
      const debounced = debounce(callback, 100);

      expect(() => debounced.cancel()).not.toThrow();
      debounced();
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);

      // cancel after execution is complete
      expect(() => debounced.cancel()).not.toThrow();
    });
  });
});