import Panel from "@/components/Panel";

const FAQ_ITEMS = [
  {
    question: "Comment fonctionne l'intégration dans un lieu réel ?",
    answer:
      "Ajoute 1 à 3 photos du lieu où tu veux apparaître (un restaurant, un rooftop, n'importe quel endroit dont tu as une image). Bluminoo Studio analyse la lumière, les matériaux et l'ambiance du lieu pour t'y intégrer de façon photoréaliste, sans avoir à écrire de description détaillée.",
  },
  {
    question: "Quels formats de photo sont acceptés ?",
    answer:
      "JPG, PNG et WebP, jusqu'à 10 Mo. Les images plus lourdes que 2 Mo sont automatiquement compressées avant l'envoi.",
  },
  {
    question: "Combien de temps prend une génération ?",
    answer: "Environ 30 secondes.",
  },
  {
    question: "Mes photos sont-elles conservées ?",
    answer:
      "Tes rendus réussis sont sauvegardés dans ta Galerie, associée à ton compte — accessibles depuis n'importe quel appareil après connexion. La politique de confidentialité détaille les sous-traitants utilisés pour le traitement des photos.",
  },
];

export default function AProposPage() {
  return (
    <div className="animate-fade-up mx-auto max-w-3xl py-8">
      <Panel className="mb-6 p-6 sm:p-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
          À propos
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">
          Bluminoo Studio
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-400">
          Bluminoo Studio transforme une photo en scène de vie
          ultra-réaliste, pensée pour impressionner ton entourage. Décris le
          décor de ton choix et l&apos;IA t&apos;y place, en préservant ton
          visage, ta pose et la lumière de la photo d&apos;origine — prête à
          poster en story.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          Propulsé par Gemini 3 Pro Image (API Google).
        </p>
      </Panel>

      <Panel className="mb-6 p-6 sm:p-8">
        <h3 className="font-display mb-5 text-2xl font-semibold text-white">
          FAQ
        </h3>
        <div className="space-y-5">
          {FAQ_ITEMS.map((item) => (
            <div key={item.question}>
              <p className="text-sm font-semibold text-neutral-100">
                {item.question}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-6 text-center sm:p-8">
        <h3 className="font-display mb-2 text-xl font-semibold text-white">
          Contact
        </h3>
        <p className="text-sm text-neutral-500">
          Une question, un problème ?{" "}
          <a
            href="mailto:mathisvergne27@gmail.com"
            className="text-primary-soft underline underline-offset-2 hover:text-primary"
          >
            mathisvergne27@gmail.com
          </a>
        </p>
      </Panel>
    </div>
  );
}
