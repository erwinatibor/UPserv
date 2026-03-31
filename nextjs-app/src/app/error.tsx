"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <button
        onClick={reset}
        className="rounded bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700"
      >
        Try again
      </button>
    </section>
  );
}
