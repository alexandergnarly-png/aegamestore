"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-50 px-4 text-sky-950">
      <section className="w-full max-w-lg rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-sky-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-100 text-2xl">
          ⚠️
        </div>

        <h1 className="mt-4 text-2xl font-black">Something went wrong</h1>

        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
          Ada error saat membuka halaman. Coba refresh atau kembali ke website
          utama.
        </p>

        <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs font-semibold text-slate-400">
          {error.message}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-black text-white hover:bg-sky-600"
          >
            Try Again
          </button>

          <a
            href="https://aegamestore.com"
            className="rounded-full bg-sky-100 px-5 py-3 text-sm font-black text-sky-700 hover:bg-sky-200"
          >
            Old Website
          </a>
        </div>
      </section>
    </main>
  );
}
