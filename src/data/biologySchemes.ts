export type BiologySchemeText = {
  ar: string;
  en: string;
};

export type BiologySchemePart = {
  id: string;
  title: BiologySchemeText;
  text: BiologySchemeText;
  image: string;
  imageAlt: BiologySchemeText;
};

export type BiologySchemeLesson = {
  id: string;
  chapter: number;
  title: BiologySchemeText;
  description?: BiologySchemeText;
  parts: BiologySchemePart[];
};

const englishText = (text: string): BiologySchemeText => ({ ar: text, en: text });

// Every part represents one screen: image first, then its related source text.
export const BIOLOGY_SCHEMES: BiologySchemeLesson[] = [
  {
    id: "reproduction-in-viruses",
    chapter: 3,
    title: englishText("Reproduction in Viruses"),
    description: englishText("The lytic and lysogenic cycles of a bacteriophage."),
    parts: [
      {
        id: "virus-overview",
        title: englishText("Reproduction in Viruses"),
        image: virusOverviewImage,
        imageAlt: englishText("A virus requiring a living host cell for reproduction"),
        text: englishText(
          "Viruses are tiny structures which can be seen only by electron microscope.\n\nThey represent a connecting link between living organisms and non-living things. Viruses cause diseases in humans, animals, and plants.\n\nThey are able to grow and reproduce inside the living cells of other organisms but cannot survive in the external environment. This is because viruses have no cellular mechanism to reproduce independently.",
        ),
      },
      {
        id: "bacteriophage-cycles",
        title: englishText("Bacteriophage Reproduction"),
        image: bacteriophageCyclesImage,
        imageAlt: englishText("A bacteriophage attacking Escherichia coli through lytic or lysogenic cycles"),
        text: englishText(
          "Information about virus reproduction is obtained by observing a type of virus attacking a kind of bacteria called Escherichia coli. This type of virus that attacks bacteria is called a bacteriophage. Viruses can reproduce by two types of interconnected cycles: the lytic cycle and the lysogenic cycle.",
        ),
      },
      {
        id: "attachment-stage",
        title: englishText("First: Lytic Cycle — 1. Attachment Stage"),
        image: attachmentImage,
        imageAlt: englishText("Bacteriophage tail fibres attaching to positions on a bacterial cell wall"),
        text: englishText(
          "When the virus comes in contact with the bacteria, the fibre existing in the tail sticks to special positions on the cellular wall of the host.",
        ),
      },
      {
        id: "penetration-stage",
        title: englishText("2. Penetration Stage"),
        image: penetrationImage,
        imageAlt: englishText("Viral DNA being injected into the host bacterial cell"),
        text: englishText(
          "The enzyme found in the tail decomposes the cell wall of the bacteria in the region of adhesion. The nucleic acid of the virus (DNA) is injected into the host cell.",
        ),
      },
      {
        id: "biosynthesis-stage",
        title: englishText("3. Biosynthesis Stage"),
        image: biosynthesisImage,
        imageAlt: englishText("Viral DNA directing the host cell to produce new viral DNA and proteins"),
        text: englishText(
          "When viral DNA enters a bacterium, it transcribes mRNA necessary for the construction of enzymes for the degradation of the DNA and mRNA of the bacteria. Then, the cellular mechanism of the bacteria produces proteins and releases energy under the control of viral DNA.\n\nViral DNA directs the mechanism of the host to form new nucleic acids (DNA) and new viral proteins.",
        ),
      },
      {
        id: "maturation-stage",
        title: englishText("4. Maturation Stage"),
        image: maturationImage,
        imageAlt: englishText("New bacteriophages assembling inside the host cell"),
        text: englishText(
          "Protein molecules are organized to form protein covers around new strands of viral nucleic acid. As a result, 100–200 new viruses are produced.",
        ),
      },
      {
        id: "release-stage",
        title: englishText("5. Release Stage"),
        image: releaseImage,
        imageAlt: englishText("A bacterial cell decomposing and releasing new viruses"),
        text: englishText(
          "New viruses cause the decomposition of the host bacterial cell. These viruses are released to infect other uninfected bacteria. This process completely takes about 25 minutes.",
        ),
      },
      {
        id: "lysogenic-cycle",
        title: englishText("Second: Lysogenic Cycle"),
        image: lysogenicImage,
        imageAlt: englishText("Viral DNA incorporated into bacterial DNA as a prophage"),
        text: englishText(
          "In the lysogenic cycle, attachment and penetration stages occur as in the lytic cycle. Then, the nucleic acid of the virus (DNA) incorporates with the nucleic acid of the bacterium (DNA) without breaking the nucleic acid of the bacterium. The combined viral DNA is called a prophage.\n\nThe prophage is duplicated through the reproduction of the bacterium.",
        ),
      },
    ],
  },
];
import virusOverviewImage from "@/assets/biology-schemes/virus-overview.svg";
import bacteriophageCyclesImage from "@/assets/biology-schemes/bacteriophage-cycles.svg";
import attachmentImage from "@/assets/biology-schemes/lytic-attachment.svg";
import penetrationImage from "@/assets/biology-schemes/lytic-penetration.svg";
import biosynthesisImage from "@/assets/biology-schemes/lytic-biosynthesis.svg";
import maturationImage from "@/assets/biology-schemes/lytic-maturation.svg";
import releaseImage from "@/assets/biology-schemes/lytic-release.svg";
import lysogenicImage from "@/assets/biology-schemes/lysogenic-cycle.svg";
