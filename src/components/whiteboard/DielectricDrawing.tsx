import type { BoardFocus } from "../../../supabase/functions/_shared/whiteboard";

type Props = {
  ar: boolean;
  visible: ReadonlySet<BoardFocus>;
  focus: BoardFocus | null;
  reveal: Partial<Record<BoardFocus, number>>;
};

export default function DielectricDrawing({ ar, visible, focus, reveal }: Props) {
  const ink = (key: BoardFocus) => ({
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: 1 - (reveal[key] ?? 1),
  });
  const show = (key: BoardFocus) => reveal[key] ?? 1;
  const weight = (key: BoardFocus) => focus === key ? 5 : 3.4;
  const opposing = visible.has("polarization");
  const net = visible.has("net-field");

  return (
    <svg viewBox="0 0 620 340" className="mx-auto block w-full max-w-[39rem]" role="img"
      aria-label={ar ? "رسم العازل بين لوحي المتسعة" : "Dielectric between two capacitor plates diagram"}>
      <g className="text-foreground" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <g opacity={show("plates")}>
          <text x="310" y="40" stroke="none" fill="currentColor" textAnchor="middle" direction={ar ? "rtl" : "ltr"} className="text-[23px] font-semibold">
            {ar ? "المتسعة مفصولة عن البطارية" : "Capacitor disconnected from battery"}
          </text>
          <path d="M80 161 Q111 159 139 160 M481 160 Q515 161 542 158" {...ink("plates")} strokeWidth="2" opacity=".55" />
          <path d="M142 91 Q140 170 143 243 M478 91 Q481 176 478 243" {...ink("plates")} strokeWidth={weight("plates")} />
          <text x="109" y="104" textAnchor="middle" fill="currentColor" stroke="none" className="text-[26px] font-bold">+</text>
          <text x="510" y="104" textAnchor="middle" fill="currentColor" stroke="none" className="text-[26px] font-bold">−</text>
        </g>

        {visible.has("dielectric") && (
          <g transform={`translate(0 ${-86 * (1 - show("dielectric"))})`} opacity={show("dielectric")}>
            <path d="M147 84 Q310 80 473 84 L473 250 Q310 254 147 249 Z" className="fill-primary/10 stroke-primary" strokeWidth={weight("dielectric")} {...ink("dielectric")} />
            <text x="310" y="287" textAnchor="middle" direction={ar ? "rtl" : "ltr"} stroke="none" className="fill-primary text-[22px] font-semibold">
              {ar ? "العازل" : "Dielectric"}
            </text>
          </g>
        )}

        {visible.has("field") && (
          <g className="text-primary" opacity={(net ? .45 : 1) * show("field")} data-field="original">
            <path d="M163 126 Q308 123 458 126 M446 118 L458 126 L446 134" strokeWidth={weight("field")} {...ink("field")} />
            <text x="310" y="111" textAnchor="middle" stroke="none" fill="currentColor" className="text-[22px] font-bold">E</text>
          </g>
        )}

        {opposing && (
          <g className="text-rose-700 dark:text-rose-300" opacity={show("polarization")} data-field="opposing">
            {[146, 183, 220].map(y => (
              <g key={y} fill="currentColor" stroke="none" textAnchor="middle" className="text-[22px] font-black">
                <text x="170" y={y}>−</text><text x="448" y={y}>+</text>
              </g>
            ))}
            <path d="M360 164 Q312 163 259 166 M271 158 L259 166 L271 174" strokeWidth={weight("polarization")} {...ink("polarization")} />
            <text x="310" y="151" textAnchor="middle" stroke="none" fill="currentColor" className="text-[20px] font-bold">E<tspan baselineShift="sub" fontSize="13">d</tspan></text>
          </g>
        )}

        {net && (
          <g className="text-teal-700 dark:text-teal-300" opacity={show("net-field")} data-field="net">
            <path d="M268 212 Q307 211 353 212 M341 204 L353 212 L341 220" strokeWidth={weight("net-field")} {...ink("net-field")} />
            <text x="310" y="201" textAnchor="middle" stroke="none" fill="currentColor" className="text-[20px] font-bold">Eₖ</text>
          </g>
        )}
      </g>
    </svg>
  );
}
