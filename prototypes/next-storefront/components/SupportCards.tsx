import { SectionHeader } from "@/components/SectionHeader";
import { siteConfig } from "@/lib/site";

const supportItems = [
  {
    icon: "💬",
    title: "Telegram Support",
    desc: "Tanya dulu kalau masih ragu soal produk, brand, durasi, atau game support.",
    href: siteConfig.links.support,
    label: "Open Telegram",
  },
  {
    icon: "🔎",
    title: "Check Order",
    desc: "Sudah bayar? Cek status order dan result lewat halaman lama yang stabil.",
    href: siteConfig.links.result,
    label: "Check Result",
  },
  {
    icon: "🔐",
    title: "Buyer Account",
    desc: "Login buyer tetap diarahkan ke sistem lama sampai migrasi selesai.",
    href: siteConfig.links.login,
    label: "Login",
  },
];

export function SupportCards() {
  return (
    <section className="px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="Support"
          title="Need assistance?"
          description="Semua flow penting masih diarahkan ke backend lama agar order tetap aman."
        />

        <div className="grid gap-3 md:grid-cols-3">
          {supportItems.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-sky-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-xl">
                {item.icon}
              </div>

              <h3 className="mt-4 text-lg font-black text-sky-950">
                {item.title}
              </h3>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {item.desc}
              </p>

              <a
                href={item.href}
                className="mt-4 inline-flex rounded-full bg-sky-100 px-4 py-2 text-xs font-black text-sky-700 hover:bg-sky-200"
              >
                {item.label}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
