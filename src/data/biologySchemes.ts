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
  {
    id: "reproduction-in-monera",
    chapter: 3,
    title: englishText("Reproduction in Monera"),
    description: englishText("Asexual and sexual reproduction in bacteria."),
    parts: [
      {
        id: "monera-overview",
        title: englishText("Reproduction in Monera"),
        image: moneraOverviewImage,
        imageAlt: englishText("Bacteria and cyanobacteria representing Monera"),
        text: englishText(
          "Monera includes bacteria and cyanobacteria. It reproduces sexually and asexually. We will focus on reproduction in bacteria as an example of reproduction in Monera.",
        ),
      },
      {
        id: "binary-fission-ready",
        title: englishText("First: Asexual Reproduction in Bacteria — Step 1"),
        image: binaryFissionReadyImage,
        imageAlt: englishText("A bacterial chromosome moving close to the cellular wall"),
        text: englishText(
          "Bacteria reproduce asexually by binary fission. This can be summarized as follows:\n\n1. The chromosome of the bacteria sticks to the plasma membrane in a certain position, and that means the bacterial cell is ready for division.",
        ),
      },
      {
        id: "binary-fission-expansion",
        title: englishText("Step 2: Cell Expansion"),
        image: binaryFissionExpansionImage,
        imageAlt: englishText("The bacterial cell membrane and plasma membrane expanding"),
        text: englishText(
          "2. The bacterial cell gets ready for binary fission by expanding the cell membrane and plasma membrane.",
        ),
      },
      {
        id: "binary-fission-dna",
        title: englishText("Step 3: DNA Division"),
        image: binaryFissionDnaImage,
        imageAlt: englishText("Two identical chromosomes forming while the bacterial cell stretches"),
        text: englishText(
          "3. The division of DNA produces two identical chromosomes, and at the same time, the cell membrane and plasma membrane start to stretch.",
        ),
      },
      {
        id: "binary-fission-separation",
        title: englishText("Step 4: Chromosome Separation"),
        image: binaryFissionSeparationImage,
        imageAlt: englishText("The chromosomes moving in different directions inside an elongated bacterial cell"),
        text: englishText(
          "4. As a result of this stretch, the two chromosomes split in two different directions within the cell. At the same time, the cytoplasm spreads and the cell’s stretch increases.",
        ),
      },
      {
        id: "binary-fission-complete",
        title: englishText("Step 5: Two Identical Cells"),
        image: binaryFissionCompleteImage,
        imageAlt: englishText("Two identical bacterial cells produced by binary fission"),
        text: englishText(
          "5. The cell divides to produce two identical cells.\n\nReproduction in bacteria (Binary Fission)",
        ),
      },
      {
        id: "conjugation-donor-recipient",
        title: englishText("Step 1: Donor and Recipient Cells"),
        image: conjugationDonorRecipientImage,
        imageAlt: englishText("A donor bacterium with the fertility factor and sex pili beside a recipient bacterium without them"),
        text: englishText(
          "Conjugation within bacteria is processed in the following steps:\n\n1. First conjugation happens between two cells. The first cell is called the donor cell. It contains the fertility factor, represented by DNA particles in the cytoplasm of the donor cell. It also contains sex pili on its surface. These structures make this cell the male donor cell. The second cell, the recipient cell, does not contain the fertility factor or sex pili and represents the female cell.",
        ),
      },
      {
        id: "conjugation-bridge",
        title: englishText("Step 2: Conjugation Bridge"),
        image: conjugationBridgeImage,
        imageAlt: englishText("A sex pilus connecting the donor and recipient bacteria to form a conjugation bridge"),
        text: englishText(
          "2. When sex pili touch the surface of the recipient cell, they transform into a conjugation bridge which binds the protoplasm of the two bacterial cells.",
        ),
      },
      {
        id: "conjugation-strand-breaks",
        title: englishText("Step 3: DNA Strand Breaks"),
        image: conjugationStrandBreaksImage,
        imageAlt: englishText("One DNA strand of the fertility factor breaking and extending toward the recipient cell"),
        text: englishText(
          "3. One DNA strand of the fertility factor breaks at a certain point and extends to transfer to the recipient cell.",
        ),
      },
      {
        id: "conjugation-transfer-replication",
        title: englishText("Step 4: Transfer and Replication"),
        image: conjugationTransferReplicationImage,
        imageAlt: englishText("The broken DNA strand moving through the bridge and replicating inside the recipient cell"),
        text: englishText(
          "4. This broken DNA, together with a part of the cytoplasm of the donor cell, moves to the recipient cell through the conjugation bridge. The DNA strand replicates itself and becomes a complete double strand of DNA.",
        ),
      },
      {
        id: "conjugation-both-plasmids",
        title: englishText("Step 5: Both Cells Possess the Plasmid"),
        image: conjugationBothPlasmidsImage,
        imageAlt: englishText("Both bacterial cells possessing the fertility factor or plasmid after conjugation"),
        text: englishText(
          "5. The donor cell remains as it was in terms of genetic material because the broken DNA strand of the fertility factor is replicated in the donor cell. At the end of conjugation, both cells possess the fertility factor or plasmid.",
        ),
      },
      {
        id: "conjugation-result",
        title: englishText("Step 6: Result of Conjugation"),
        image: conjugationResultImage,
        imageAlt: englishText("The conjugation result showing that only part of the genetic material was transferred"),
        text: englishText(
          "6. This kind of sexual reproduction is not an ordinary one, because the new bacterium does not receive a complete collection of genes from both original cells.",
        ),
      },
    ],
  },
  {
    id: "asexual-reproduction-in-paramecium",
    chapter: 3,
    title: englishText("Asexual Reproduction in Paramecium"),
    description: englishText("Transverse binary fission in Paramecium."),
    parts: [
      {
        id: "paramecium-micronucleus-division",
        title: englishText("Step 1: Micronucleus Division"),
        image: parameciumMicronucleusDivisionImage,
        imageAlt: englishText("The micronucleus beginning normal division inside a Paramecium"),
        text: englishText(
          "Paramecium reproduces asexually by transverse binary fission, which is explained as follows:\n\n1. Division starts by normal division of micronucleus.",
        ),
      },
      {
        id: "paramecium-nuclei-move",
        title: englishText("Step 2: Nuclei Move Apart"),
        image: parameciumNucleiMoveImage,
        imageAlt: englishText("The two micronuclei moving to opposite sides while the macronucleus extends and a cytostome appears"),
        text: englishText(
          "2. After division of micronucleus, each nucleus moves to the opposite side of Paramecium. At the same time, macronucleus extends and cytostome (mouth) appears.",
        ),
      },
      {
        id: "paramecium-macronucleus-amitosis",
        title: englishText("Step 3: Macronucleus Amitosis"),
        image: parameciumMacronucleusAmitosisImage,
        imageAlt: englishText("The macronucleus dividing by amitosis as new mouths and contractile vacuoles appear"),
        text: englishText(
          "3. Macronucleus divides by amitosis into two nuclei and moves to the two sides of Paramecium. A new mouth and two new contractile vacuoles appear, and the body of Paramecium also stretches.",
        ),
      },
      {
        id: "paramecium-two-new-cells",
        title: englishText("Step 4: Two New Paramecia"),
        image: parameciumTwoCellsImage,
        imageAlt: englishText("Two new paramecia formed by transverse binary fission"),
        text: englishText("4. Paramecium divides into two new paramecia."),
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
import moneraOverviewImage from "@/assets/biology-schemes/monera-overview.svg";
import binaryFissionReadyImage from "@/assets/biology-schemes/binary-fission-ready.svg";
import binaryFissionExpansionImage from "@/assets/biology-schemes/binary-fission-expansion.svg";
import binaryFissionDnaImage from "@/assets/biology-schemes/binary-fission-dna.svg";
import binaryFissionSeparationImage from "@/assets/biology-schemes/binary-fission-separation.svg";
import binaryFissionCompleteImage from "@/assets/biology-schemes/binary-fission-complete.svg";
import conjugationDonorRecipientImage from "@/assets/biology-schemes/conjugation-step-1-donor-recipient.svg";
import conjugationBridgeImage from "@/assets/biology-schemes/conjugation-step-2-bridge.svg";
import conjugationStrandBreaksImage from "@/assets/biology-schemes/conjugation-step-3-strand-breaks.svg";
import conjugationTransferReplicationImage from "@/assets/biology-schemes/conjugation-step-4-transfer-replication.svg";
import conjugationBothPlasmidsImage from "@/assets/biology-schemes/conjugation-step-5-both-plasmids.svg";
import conjugationResultImage from "@/assets/biology-schemes/conjugation-step-6-result.svg";
import parameciumMicronucleusDivisionImage from "@/assets/biology-schemes/paramecium-step-1-micronucleus.svg";
import parameciumNucleiMoveImage from "@/assets/biology-schemes/paramecium-step-2-nuclei-move.svg";
import parameciumMacronucleusAmitosisImage from "@/assets/biology-schemes/paramecium-step-3-amitosis.svg";
import parameciumTwoCellsImage from "@/assets/biology-schemes/paramecium-step-4-two-cells.svg";
