const steps = [
  {
    number: "01",
    title: "Pick product",
    desc: "Choose game, brand, and duration from the catalog.",
  },
  {
    number: "02",
    title: "Pay securely",
    desc: "Checkout tetap diarahkan ke sistem payment backend lama.",
  },
  {
    number: "03",
    title: "Check result",
    desc: "Setelah payment selesai, cek order result untuk ambil key.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-500">
            How It Works
          </p>
          <h2 className="mt-1 text-2xl font-black text-sky-950">
            Simple checkout flow
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sm font-black text-sky-700">
                {step.number}
              </div>

              <h3 className="mt-4 text-lg font-black text-sky-950">
                {step.title}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {step.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
