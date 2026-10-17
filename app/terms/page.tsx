import Panel from "@/components/Panel";
import LegalIdentityNotice from "@/components/LegalIdentityNotice";

export default function CgvPage() {
  return (
    <div className="animate-fade-up mx-auto max-w-3xl py-8">
      <Panel className="p-6 sm:p-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
          Conditions générales
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">
          Conditions générales de vente
        </h2>

        <LegalIdentityNotice />

        <div className="space-y-6 text-sm leading-relaxed text-neutral-400">
          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              1. Objet
            </h3>
            <p>
              Les présentes conditions générales de vente (CGV) régissent la
              souscription aux offres payantes de Bluminoo Studio, service en
              ligne permettant de générer des images et vidéos par
              intelligence artificielle à partir de photos fournies par
              l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              2. Offres et tarifs
            </h3>
            <p>
              Bluminoo Studio propose trois formules d&apos;abonnement
              mensuel :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Lite : 9,99 € / mois — 2 000 crédits / mois (images
                en 1K, sans vidéo ni Red Snap)
              </li>
              <li>
                Pro : 19,99 € / mois — 4 500 crédits / mois (images
                jusqu&apos;en 2K, vidéo et Red Snap)
              </li>
              <li>
                Max : 39,99 € / mois — 10 000 crédits / mois (images
                jusqu&apos;en 4K, vidéo et Red Snap)
              </li>
            </ul>
            <p className="mt-2">
              Des packs de crédits sont également proposés à l&apos;unité, en
              paiement unique et sans abonnement : 1 000 crédits pour
              7,99 €, 2 000 crédits pour 14,99 € et 4 500 crédits pour
              29,99 €. Ils n&apos;expirent pas et ne donnent accès à
              aucune fonctionnalité supplémentaire.
            </p>
            <p className="mt-2">
              Les crédits sont consommés à chaque génération réussie (image
              ou vidéo). Les crédits d&apos;abonnement sont remis à zéro puis
              rechargés à chaque renouvellement mensuel ; ceux non utilisés
              en fin de période ne sont ni reportés, ni remboursés. Les
              prix sont affichés en euros, toutes taxes comprises.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              3. Paiement et renouvellement
            </h3>
            <p>
              Le paiement s&apos;effectue par carte bancaire via le
              prestataire Stripe, qui traite directement les données
              bancaires — Bluminoo Studio n&apos;a jamais accès au numéro de
              carte. L&apos;abonnement est à durée indéterminée et se
              renouvelle automatiquement chaque mois par prélèvement de la
              même carte, jusqu&apos;à résiliation.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              4. Résiliation
            </h3>
            <p>
              L&apos;utilisateur peut résilier son abonnement à tout moment
              depuis son espace de facturation (accessible via la page
              Compte). La résiliation prend effet à la fin de la période en
              cours déjà payée ; aucun remboursement au prorata n&apos;est
              effectué pour la période en cours.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              5. Droit de rétractation
            </h3>
            <p>
              Conformément à l&apos;article L221-28 du Code de la
              consommation, le droit de rétractation ne peut être exercé
              pour les contenus numériques fournis sur un support immatériel
              dont l&apos;exécution a commencé après accord préalable exprès
              du consommateur, qui a également renoncé à son droit de
              rétractation. En souscrivant à une offre payante ou en
              achetant un pack de crédits, l&apos;utilisateur reconnaît que
              l&apos;accès aux crédits est immédiat et renonce expressément
              à son droit de rétractation dès le premier usage de crédits.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              6. Responsabilité
            </h3>
            <p>
              Les contenus générés (images, vidéos) le sont par des modèles
              d&apos;intelligence artificielle tiers et peuvent comporter des
              imperfections, inexactitudes ou ne pas correspondre
              parfaitement à la demande. Bluminoo Studio ne garantit pas un
              résultat spécifique et ne saurait être tenu responsable d&apos;un
              usage des contenus générés contraire à la loi ou aux droits de
              tiers (droit à l&apos;image, propriété intellectuelle,
              contrefaçon de marque, etc.), qui relève de la seule
              responsabilité de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              7. Droit applicable et litiges
            </h3>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de
              litige, l&apos;utilisateur peut recourir à une médiation de la
              consommation avant toute action judiciaire. À défaut de
              résolution amiable, les tribunaux français seront seuls
              compétents.
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-neutral-100">
              8. Contact
            </h3>
            <p>
              Pour toute question relative aux présentes CGV :{" "}
              <a
                href="mailto:mathisvergne27@gmail.com"
                className="text-primary-soft underline underline-offset-2 hover:text-primary"
              >
                mathisvergne27@gmail.com
              </a>
            </p>
          </section>
        </div>
      </Panel>
    </div>
  );
}
