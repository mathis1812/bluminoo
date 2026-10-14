// Témoignages clients réels, affichés sur /landing (section "Ce qu'ils en disent").
//
// Ne JAMAIS inventer de témoignage ici. Chaque entrée doit correspondre à un
// retour authentique d'un(e) utilisateur(rice) de Bluminoo Studio, avec son
// consentement explicite à être cité(e) publiquement (nom/pseudo + citation).
// `quoteFr` est la citation d'origine, mot pour mot (reprise du commit 280a3c2),
// affichée sur la landing FR. `quote` est sa traduction anglaise ; la traduction doit rester fidèle au sens et au ton exprimés
// par la personne, sans jamais en inventer ni en édulcorer le contenu.
//
// Tant que ce tableau est vide, la section témoignages ne s'affiche pas sur la
// landing page : celle-ci retombe sur les sections stats / différenciateurs
// existantes. Dès qu'un vrai témoignage a été recueilli (et son consentement
// obtenu), ajoute une entrée ici et la section apparaîtra automatiquement.

export type Testimonial = {
  /** Prénom ou pseudo de la personne, tel qu'elle a accepté d'être citée. */
  name: string;
  /** Rôle / contexte facultatif (ex: "Créatrice de contenu"). */
  role?: string;
  /** Citation traduite en anglais (landing US). */
  quote: string;
  /** Citation d'origine, en français, mot pour mot (landing FR). */
  quoteFr: string;
  /** Note optionnelle sur 5, si l'utilisateur en a laissé une. */
  rating?: number;
};

export const TESTIMONIALS: Testimonial[] = [
  { name: "ARTHUR_M78", quote: "This AI blows the others away, I recommend it!", quoteFr: "Cette IA met une tempête aux autres je vous recommande!" },
  { name: "SARAH_SHY", quote: "Super realistic, I was a bit skeptical at first but it's absolutely perfect.", quoteFr: "Super réaliste, j'étais un peu sceptique au début mais c'est absolument parfait." },
  { name: "NEXTAZ_GOAT", quote: "Thank you so much, you did a great job. And it's one of the best sites I've used", quoteFr: "Merci beaucoup vous avez fait un super travail. Et cest un des meilleurs sites que j'ai eu" },
  { name: "MARC_ANT75", quote: "A very serious site that keeps improving day by day, thank you for your work and dedication!", quoteFr: "Site très sérieux qui ne cesse de s'améliorer de jour en jour, merci de votre travail et investissement!" },
  { name: "LUC_SKY01", quote: "Clear and precise, keep improving the details and lower the prices a bit", quoteFr: "Clair net et précis continuer d'améliorer les points et réduire un peu les prix" },
  { name: "VIDEO_MAKER", quote: "Very good, but keep working on it and if possible add a video feature", quoteFr: "Très bien mais continuer de travailler dessus et si possible mettre une fonctionnalité vidéo" },
  { name: "JOURDAN", quote: "I just wanted to share my opinion about the site, I find it honestly beautiful, and the images are realistic!", quoteFr: "C'était juste pour vous faire part de mon avis vis à vis du site, je le trouve franchement magnifique, et les images sont réalistes !" },
  { name: "RWAN", quote: "I talked with customer support and everything went really well, the problem was resolved quickly", quoteFr: "J'ai discuté avec le service client et tout c'est super bien passé le problème a était résolu rapidement" },
  { name: "AYMAN", quote: "Thanks for your efforts to make the AI really fun, we had a good laugh with colleagues, but it's missing an unlimited premium tier", quoteFr: "Merci de vos efforts pour rendre l'ia vraiment amusante on a bien rigoler entre colleges mais il manque une catégorie supérieur illimité" },
  { name: "METII", quote: "much respect guys, you nailed it", quoteFr: "force a vous les gars vous avez dead ça" },
  { name: "TOOKIE", quote: "This AI has huge potential and deserves 5 stars", quoteFr: "Cette IA a énormément de potentiel et mérite les 5 étoiles" },
  { name: "ALESS", quote: "it's great, keep it up and keep improving the AI", quoteFr: "c'est super continuez comme ça et continuez d'améliorer l'IA" },
  { name: "WASSIM", quote: "I think the site is great, it's just missing a little something to reach perfect development", quoteFr: "je trouve le site super manque juste un peu pour arriver à un développement parfait" },
  { name: "RESULY", quote: "Beautiful, honestly I understood everything and the price is reasonable", quoteFr: "Magnifique franchement j'ai tout compris et prix raisonnable" },
  { name: "T57", quote: "very good and complete site", quoteFr: "site très bien et complet" },
  { name: "ADAMBEK", quote: "It's super cool, it's just that the credits get used up too fast, same with the price", quoteFr: "C'est super cool juste les crédits s'utilisent trop vite comme le prix" },
  { name: "ERWEAN87", quote: "I was afraid it was a scam but honestly it's a banger, go for it guys", quoteFr: "J'avais peur que ce soit une arnaque mais sah banger foncez les mecs" },
  { name: "ENDWINGIRARD", quote: "I was really hesitant at first but it was totally worth it, brothers", quoteFr: "j'hésitais carrément au début mais ça valait vrm le coup les frères" },
  { name: "FLAVI", quote: "honestly you're doing an incredible job, keep it up, it's thanks to you that we'll get access to some seriously crazy stuff", quoteFr: "franchement vous faites un boulot incroyable continuer comme ça c'est grave à vous qu'on aura accès à des trucs de fou furieux" },
  { name: "THOMASGUI", quote: "Very good, top-tier AI", quoteFr: "Très bien, IA au top" },
  { name: "G_PLAYER_X", quote: "Finally a tool that respects textures and natural light.", quoteFr: "Enfin un outil qui respecte les textures et la lumière naturelle." },
  { name: "LORYS_VIBE", quote: "Blown away by the precision of Red Snap. It's clean and fast.", quoteFr: "Bluffé par la précision du Snap Rouge. C'est propre et rapide." },
  { name: "ZEN_USER_99", quote: "Keep doing what you're doing, you're doing an extraordinary job. Plus you're responsive when there's an issue. Thanks!", quoteFr: "Continuer ce que vous faites, vous faites un travail extraordinaire. En plus vous êtes réactif quand il y a un problème. Merci!" },
  { name: "TOM_RIDER", quote: "you guys are the best, keep going on this path, I hope for you, you could go far", quoteFr: "vous êtes top les mec continuez sur ce chemin je l'espère pour vous, vous pourriez allez loin" },
  { name: "GIRAFE93FANTE", quote: "if only I'd had this sooner, my buddy believes anything thanks to the Red Snap thing 🤣", quoteFr: "si seulement j'avais eu ça plus tôt mon pote croit à tout grâce au truc snap rouge 🤣" },
  { name: "ENTIFACHO", quote: "thanks for including Red Snap tech in the Essential plan, you guys rock 🙏", quoteFr: "merci d'avoir mis la tech snap rouge intégrée dans l'abonnement essentiel vous gérer 🙏" },
  { name: "PEPITRDOR999", quote: "I don't regret my purchase one bit, I skipped a kebab and ended up with this banger instead 😭🙏", quoteFr: "je regrette tellement pas mon achat j'ai évité de manger un kebab et je me retrouve avce ce banger 😭🙏" },
  { name: "MASKEYTV", quote: "for a start I'll give it a 4.5 rating because nothing and nobody is perfect, but it's extremely high quality", quoteFr: "pour un début je vous donne la note de 4.5 car rien n'y personne n'est parfait mais c'est extrêmement quali" },
  { name: "PAYXLANPY", quote: "Well done for your work, a lot of people love the site, it's really good work!", quoteFr: "Bravo pour votre travail de nombreuse personne adore le site, c'est du très bon boulot !" },
];
