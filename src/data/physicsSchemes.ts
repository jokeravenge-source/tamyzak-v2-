import definitionImage from "@/assets/physics-schemes/01-definition.svg";
import causeImage from "@/assets/physics-schemes/02-cause.svg";
import copperPlateImage from "@/assets/physics-schemes/03-copper-plate.svg";
import heatLossImage from "@/assets/physics-schemes/04-heat-loss.svg";
import laminatedCoreImage from "@/assets/physics-schemes/05-laminated-core.svg";
import lenzLawImage from "@/assets/physics-schemes/06-lenz-law.svg";
import directionsImage from "@/assets/physics-schemes/07-directions.svg";
import forceImage from "@/assets/physics-schemes/08-force.svg";
import applicationsImage from "@/assets/physics-schemes/09-applications.svg";
import trainImage from "@/assets/physics-schemes/10-train-brakes.svg";
import detectorSetupImage from "@/assets/physics-schemes/11-detector-setup.svg";
import detectionImage from "@/assets/physics-schemes/12-detection.svg";
import memoryMapImage from "@/assets/physics-schemes/13-memory-map.svg";

export type PhysicsSchemeText = { ar: string; en: string };

export type PhysicsSchemePart = {
  id: string;
  title: PhysicsSchemeText;
  text: PhysicsSchemeText;
  image: string;
  imageAlt: PhysicsSchemeText;
};

export type PhysicsSchemeLesson = {
  id: string;
  chapter: number;
  title: PhysicsSchemeText;
  description: PhysicsSchemeText;
  parts: PhysicsSchemePart[];
};

const bilingual = (en: string, ar = en): PhysicsSchemeText => ({ ar, en });

export const PHYSICS_SCHEMES: PhysicsSchemeLesson[] = [
  {
    id: "eddy-currents",
    chapter: 2,
    title: bilingual("Eddy Currents", "التيارات الدوامة"),
    description: bilingual("Definition, Lenz’s law, energy loss, and practical applications.", "التعريف وقانون لنز وفقدان الطاقة والتطبيقات العملية."),
    parts: [
      {
        id: "definition",
        title: bilingual("Part 1 — What Are Eddy Currents?", "الجزء 1 — ما هي التيارات الدوامة؟"),
        image: definitionImage,
        imageAlt: bilingual("Closed circular currents inside a metal conductor"),
        text: bilingual("Eddy currents are closed and circular induced currents. They flow inside metal conductors or plates and are perpendicular to the magnetic flux (ΦB) causing them.\n\nEasy memory line:\nEddy currents = closed circular currents induced inside a conductor."),
      },
      {
        id: "cause",
        title: bilingual("Why Are Eddy Currents Created?", "لماذا تتولد التيارات الدوامة؟"),
        image: causeImage,
        imageAlt: bilingual("A chain from relative motion to changing flux, induced EMF, and eddy currents"),
        text: bilingual("Eddy currents are produced when a conductor experiences a changing magnetic flux. This happens according to Faraday’s law of electromagnetic induction.\n\nMemorize the chain:\nRelative motion → Changing flux → Induced EMF → Eddy currents"),
      },
      {
        id: "copper-plate",
        title: bilingual("Example: Copper Plate", "مثال: صفيحة نحاسية"),
        image: copperPlateImage,
        imageAlt: bilingual("A copper plate moving between electromagnet poles"),
        text: bilingual("Suppose a copper plate is pulled horizontally between the poles of an electromagnet. The magnetic field is directed downward.\n\nBecause there is relative movement between the copper plate and the magnetic field, the magnetic flux through the plate changes. According to Faraday’s law, eddy currents are generated on the surface of the plate."),
      },
      {
        id: "heat-loss",
        title: bilingual("Disadvantage: Heat Loss", "العيب: فقدان الطاقة الحرارية"),
        image: heatLossImage,
        imageAlt: bilingual("Eddy currents producing heat in an iron core"),
        text: bilingual("The main disadvantage is that energy is wasted in the form of heat, according to Joule’s law. This can occur in electrical devices, transformers, and iron cores of coils.\n\nEasy memory:\nEddy currents → Heat → Energy loss"),
      },
      {
        id: "reduce",
        title: bilingual("How Do We Reduce Eddy Currents?", "كيف نقلل التيارات الدوامة؟"),
        image: laminatedCoreImage,
        imageAlt: bilingual("Electrically isolated laminated iron plates reducing eddy currents"),
        text: bilingual("A transformer core is made from thin wrought-iron plates instead of one solid piece. The plates are arranged parallel to the changing magnetic flux, electrically isolated from each other, and tightly compressed together. This increases electrical resistance.\n\nLaminated core → Resistance ↑ → Eddy currents ↓ → Heat loss ↓"),
      },
      {
        id: "lenz-law",
        title: bilingual("Part 2 — Lenz’s Law", "الجزء 2 — قانون لنز"),
        image: lenzLawImage,
        imageAlt: bilingual("An induced magnetic field opposing the change that created it"),
        text: bilingual("According to Lenz’s law, induced currents create a magnetic field that opposes the change that produced them.\n\nEddy currents always try to oppose the change in magnetic flux."),
      },
      {
        id: "plate-directions",
        title: bilingual("Direction of Eddy Currents", "اتجاه التيارات الدوامة"),
        image: directionsImage,
        imageAlt: bilingual("Clockwise and counterclockwise eddy currents on opposite sides of a moving plate"),
        text: bilingual("When the right side of the plate moves out of the magnetic field, the magnetic flux decreases. A clockwise eddy current forms and produces a downward induced magnetic field, supporting the decreasing original field.\n\nOn the left side of the plate, the eddy current flows counterclockwise, also according to Lenz’s law."),
      },
      {
        id: "opposing-force",
        title: bilingual("The Opposing Magnetic Force", "القوة المغناطيسية المعاكسة"),
        image: forceImage,
        imageAlt: bilingual("Magnetic force opposing the pulling force on a plate"),
        text: bilingual("The eddy currents produce a magnetic force FB in the direction opposite to the pulling force. Therefore, the magnetic force opposes the movement of the plate.\n\nPlate moves → Flux changes → Eddy currents → Induced magnetic field → Opposing magnetic force\n\nEddy currents fight the motion that creates them."),
      },
      {
        id: "applications",
        title: bilingual("Part 3 — Applications", "الجزء 3 — التطبيقات"),
        image: applicationsImage,
        imageAlt: bilingual("Train brakes, a metal detector, and traffic lights"),
        text: bilingual("Three important applications are train brakes, metal detectors, and traffic lights.\n\nMemory shortcut: TMT\nTrains — Metal detectors — Traffic lights"),
      },
      {
        id: "train-brakes",
        title: bilingual("Eddy Currents in Train Brakes", "التيارات الدوامة في مكابح القطارات"),
        image: trainImage,
        imageAlt: bilingual("Electromagnets generating eddy-current braking force in railway rails"),
        text: bilingual("Wire coils act as electromagnets facing the railway rails. During normal uniform movement, no current flows in the coils.\n\nWhen braking starts, the circuit closes and current flows through the coils, producing a strong magnetic field through the rails. Relative motion generates eddy currents in the rails. By Lenz’s law, their magnetic field opposes the train’s movement, so the train slows and stops.\n\nCurrent → Magnetic field → Eddy currents → Opposing field → Train stops"),
      },
      {
        id: "detector-setup",
        title: bilingual("Metal Detector: Transmitter and Receiver", "كاشف المعادن: المرسل والمستقبل"),
        image: detectorSetupImage,
        imageAlt: bilingual("Transmitter and receiver coils with an air reference reading"),
        text: bilingual("Metal detectors used at airports and checkpoints depend on electromagnetic induction, sometimes called pulse induction.\n\nThe detector has a transmitter coil and a receiver coil. An alternating potential difference applied to the transmitter produces alternating current and alternating magnetic flux. The changing flux induces a current in the receiver. First, the detector measures a normal reference reading with only air between the coils."),
      },
      {
        id: "metal-detection",
        title: bilingual("Metal Detector: Detecting an Object", "كاشف المعادن: اكتشاف الجسم"),
        image: detectionImage,
        imageAlt: bilingual("Eddy currents in a metal object changing the receiver-coil reading"),
        text: bilingual("When a conducting metal object enters between the transmitter and receiver, eddy currents form inside it; the object does not have to be a plate. These currents oppose the transmitter’s changing magnetic flux. The receiver current changes or decreases compared with the reference reading, so the detector recognizes the metal.\n\nTransmitter → Magnetic flux → Metal → Eddy currents → Receiver changes → Metal detected"),
      },
      {
        id: "memory-map",
        title: bilingual("Final Memory Map", "خريطة الحفظ النهائية"),
        image: memoryMapImage,
        imageAlt: bilingual("A three-part memory map for eddy currents"),
        text: bilingual("BASICS\nChanging magnetic flux → Eddy currents → Heat loss\nLaminated iron → Resistance ↑ → Eddy currents ↓ → Heat ↓\n\nLENZ’S LAW\nMotion → Flux changes → Eddy currents → Opposing magnetic field → Opposing force\n\nAPPLICATIONS (TMT)\nTrain brakes: Magnetic field → Eddy currents → Oppose motion → Stop\nMetal detector: Transmitter → Flux → Metal → Eddy currents → Receiver changes → Detection\nTraffic lights: Eddy currents can be used in systems that detect metal vehicles."),
      },
    ],
  },
];
