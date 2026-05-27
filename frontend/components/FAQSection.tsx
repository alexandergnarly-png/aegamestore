import { SectionHeader } from "@/components/SectionHeader";

const faqs = [
  {
    q: "Is this already the final website?",
    a: "Belum. Ini frontend Next.js baru yang masih tahap migrasi. Checkout dan payment masih memakai sistem lama.",
  },
  {
    q: "Can I buy directly from this page?",
    a: "Tombol Buy masih diarahkan ke website lama agar flow payment tetap aman.",
  },
  {
    q: "Why is the product data live?",
    a: "Karena frontend ini sudah mengambil data dari backend Express production melalui public API.",
  },
  {
    q: "Where do I contact support?",
    a: "Gunakan tombol Telegram Support jika butuh tanya stok, game support, atau bantuan order.",
  },
];

export function FAQSection() {
  return (
    <section className="px-4 pb-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="Quick answers while the Next.js frontend is still being migrated."
        />

        <div className="grid gap-3 md:grid-cols-2">
          {faqs.map((item) => (
            <article
              key={item.q}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100"
            >
              <h3 className="text-base font-black text-sky-950">{item.q}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {item.a}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
