/** Ideal series RLC. x = omega/omega_r; r = R/sqrt(L/C). */
export const reactance=(x:number)=>x-1/x;
export const current=(x:number,r=.2)=>.2/Math.hypot(r,reactance(x));
export const relativePower=(x:number,r=.5)=>r*r/(r*r+reactance(x)**2);
export const fixedVoltagePower=(x:number,r:number)=>.2*r/(r*r+reactance(x)**2);
export const halfPower=(r:number)=>[(Math.sqrt(r*r+4)-r)/2,(Math.sqrt(r*r+4)+r)/2];
export const resonance=(l:number,c:number)=>1/(2*Math.PI*Math.sqrt(l*c));

// C changes at fixed L and R: r grows as resonant frequency falls.
export const tunedCurrent=(x:number,fr:number,r0=.2)=>{const r=r0/fr;return r/Math.hypot(r,reactance(x/fr));};
