export default function Loading() {
  return (
    <main className="min-h-screen bg-sky-50 px-4 py-8 text-sky-950">
      <div className="mx-auto max-w-6xl">
        <div className="h-24 animate-pulse rounded-[2rem] bg-white shadow-sm ring-1 ring-sky-100" />

        <div className="mt-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="h-80 animate-pulse rounded-[2rem] bg-white shadow-sm ring-1 ring-sky-100" />
          <div className="h-80 animate-pulse rounded-[2rem] bg-white shadow-sm ring-1 ring-sky-100" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-3xl bg-white shadow-sm ring-1 ring-sky-100"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
