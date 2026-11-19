import { describe, expect, it, vi } from "vitest";
import { saveMovieOptimistically } from "@/lib/movie-edit";

describe("saveMovieOptimistically", () => {
  it("shows the new movie immediately and keeps it when the save succeeds", async () => {
    const onChange = vi.fn();
    const persist = vi.fn().mockResolvedValue("Arrival");
    await expect(saveMovieOptimistically("Interstellar", "Arrival", persist, onChange)).resolves.toBe("Arrival");
    expect(onChange).toHaveBeenNthCalledWith(1, "Arrival");
    expect(onChange).toHaveBeenLastCalledWith("Arrival");
    expect(persist).toHaveBeenCalledWith("Arrival");
  });

  it("restores the previous movie when the server rejects the save", async () => {
    const onChange = vi.fn();
    const failure = new Error("Network error");
    const persist = vi.fn().mockRejectedValue(failure);
    await expect(saveMovieOptimistically("Interstellar", "Arrival", persist, onChange)).rejects.toBe(failure);
    expect(onChange).toHaveBeenNthCalledWith(1, "Arrival");
    expect(onChange).toHaveBeenLastCalledWith("Interstellar");
  });
});
