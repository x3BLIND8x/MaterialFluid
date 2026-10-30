import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FileInput, type FileUploadOptions } from "../src/kit/forms";
import { MaterialFluidProvider } from "../src/kit/provider";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const file = new File(["document"], "document.pdf", { type: "application/pdf" });
function choose() {
  const input = screen.getByLabelText("Attachment") as HTMLInputElement;
  Object.defineProperty(input, "files", { configurable: true, writable: true, value: [file] });
  fireEvent.change(input);
  return input;
}
function setup(onUpload?: (file: File, options: FileUploadOptions) => Promise<void>) {
  return render(<MaterialFluidProvider motion="minimal"><form><FileInput label="Attachment" onUpload={onUpload} /></form></MaterialFluidProvider>);
}
describe("file upload lifecycle", () => {
  it("reports actual progress and only marks success after the upload resolves", async () => {
    let options!: FileUploadOptions;
    let finish!: () => void;
    const upload = vi.fn((_file: File, context: FileUploadOptions) => { options = context; return new Promise<void>(resolve => { finish = resolve; }); });
    setup(upload); choose();
    await waitFor(() => expect(upload).toHaveBeenCalledOnce());
    const bar = screen.getByRole("progressbar");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    act(() => options.onProgress(42));
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
    act(() => options.onProgress(150));
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(screen.queryByText("Uploaded")).toBeNull();
    await act(async () => finish());
    expect(screen.getByText("Uploaded")).toBeTruthy();
  });
  it("supports retry after failure", async () => {
    const upload = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
    setup(upload); choose();
    await waitFor(() => expect(screen.getByText("Upload failed. Try again.")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Retry document.pdf" }));
    await waitFor(() => expect(screen.getByText("Uploaded")).toBeTruthy());
    expect(upload).toHaveBeenCalledTimes(2);
  });
  it("aborts removal and ignores late progress and completion", async () => {
    class Transfer { files: File[] = []; items = { add: (item: File) => this.files.push(item) }; }
    vi.stubGlobal("DataTransfer", Transfer);
    let options!: FileUploadOptions;
    let finish!: () => void;
    setup((_file, context) => { options = context; return new Promise<void>(resolve => { finish = resolve; }); });
    const input = choose();
    await waitFor(() => expect(options).toBeDefined());
    fireEvent.click(screen.getByRole("button", { name: "Remove document.pdf" }));
    expect(options.signal.aborted).toBe(true);
    expect(input.files?.length).toBe(0);
    await act(async () => { options.onProgress(70); finish(); });
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.queryByText("Uploaded")).toBeNull();
  });
  it("aborts uploads on reset and unmount", async () => {
    const signals: AbortSignal[] = [];
    const { container, unmount } = setup((_file, options) => { signals.push(options.signal); return new Promise<void>(() => {}); });
    choose();
    await waitFor(() => expect(signals.length).toBe(1));
    await act(async () => { fireEvent.reset(container.querySelector("form")!); });
    expect(signals[0].aborted).toBe(true);
    expect(screen.queryByRole("listitem")).toBeNull();
    choose();
    await waitFor(() => expect(signals.length).toBe(2));
    unmount();
    expect(signals[1].aborted).toBe(true);
  });
  it("aborts the previous upload when a single file is replaced", async () => {
    const signals: AbortSignal[] = [];
    setup((_file, options) => { signals.push(options.signal); return new Promise<void>(() => {}); });
    const input = choose();
    await waitFor(() => expect(signals.length).toBe(1));
    Object.defineProperty(input, "files", { configurable: true, writable: true, value: [new File(["other"], "other.pdf")] });
    fireEvent.change(input);
    await waitFor(() => expect(signals.length).toBe(2));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });
  it("keeps selection local when no transport is supplied", () => {
    setup(); choose();
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.queryByText("Uploaded")).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});


describe("file selection limits", () => {
  function transferStub() {
    class Transfer { files: File[] = []; items = { add: (item: File) => this.files.push(item) }; }
    vi.stubGlobal("DataTransfer", Transfer);
  }
  it("enforces the combined limit for browsing and dropping without losing existing files", async () => {
    transferStub();
    const upload = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<MaterialFluidProvider motion="minimal"><FileInput multiple maxFiles={2} label="Attachment" onUpload={upload} /></MaterialFluidProvider>);
    const input = choose();
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
    const extra = [new File(["a"], "a.pdf"), new File(["b"], "b.pdf")];
    Object.defineProperty(input, "files", { configurable: true, writable: true, value: extra });
    fireEvent.change(input);
    expect(screen.getByRole("alert").textContent).toBe("Choose up to 2 files.");
    expect(Array.from(input.files ?? [])).toEqual([file]);
    fireEvent.drop(container.querySelector(".mf-file-drop")!, { dataTransfer: { files: extra } });
    expect(Array.from(input.files ?? [])).toEqual([file]);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(screen.getByText("1 / 2 files selected")).toBeTruthy();
    // Duplicate additions do not consume another slot, and a valid addition recovers.
    Object.defineProperty(input, "files", { configurable: true, writable: true, value: [file, extra[0]] });
    fireEvent.change(input);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(Array.from(input.files ?? [])).toEqual([file, extra[0]]);
  });
  it("exposes the default maximum and Persian digits", () => {
    render(<MaterialFluidProvider locale="fa" motion="minimal"><FileInput multiple label="پیوست" /></MaterialFluidProvider>);
    expect(screen.getByText("حداکثر ۵ فایل")).toBeTruthy();
  });
  it("retries only the failed file and preserves completed uploads", async () => {
    transferStub();
    const other = new File(["other"], "other.pdf");
    const attempts = new Map<File, number>();
    const upload = vi.fn((item: File) => {
      const count = (attempts.get(item) ?? 0) + 1;
      attempts.set(item, count);
      return item === other && count === 1 ? Promise.reject(new Error("offline")) : Promise.resolve();
    });
    render(<MaterialFluidProvider motion="minimal"><FileInput multiple label="Attachment" onUpload={upload} /></MaterialFluidProvider>);
    const input = screen.getByLabelText("Attachment");
    Object.defineProperty(input, "files", { configurable: true, writable: true, value: [file, other] });
    fireEvent.change(input);
    await waitFor(() => expect(screen.getByRole("button", { name: "Retry other.pdf" })).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Retry other.pdf" }));
    await waitFor(() => expect(screen.getAllByText("Uploaded")).toHaveLength(2));
    expect(attempts.get(file)).toBe(1);
    expect(attempts.get(other)).toBe(2);
  });
});
