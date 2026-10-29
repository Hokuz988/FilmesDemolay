/*
 * Heráldica da Ordem DeMolay, desenhada a partir do emblema oficial: espadas cruzadas,
 * coroa com os dez rubis, elmo, cruz branca de cinco braços e o medalhão anil
 * com o crescente cercado de estrelas.
 */

export const VIRTUDES = [
  'Amor Filial',
  'Reverência pelas Coisas Sagradas',
  'Cortesia',
  'Companheirismo',
  'Fidelidade',
  'Pureza',
  'Patriotismo',
];

const ANIL = 'var(--color-anil)';
const OURO = 'var(--color-ouro)';
const RUBI = 'var(--color-rubi)';
const OURO_SOMBRA = '#c98a06';
const ACO = '#e4e6f5';

const arredondar = (n: number) => Math.round(n * 100) / 100;

function caminhoEstrela(cx: number, cy: number, externo: number, interno: number) {
  const pontos = Array.from({ length: 10 }, (_, i) => {
    const angulo = ((-90 + i * 36) * Math.PI) / 180;
    const raio = i % 2 ? interno : externo;
    return `${arredondar(cx + raio * Math.cos(angulo))} ${arredondar(cy + raio * Math.sin(angulo))}`;
  });
  return `M${pontos.join('L')}Z`;
}

// Medalhão centrado em (100, 144): dez estrelas em volta do crescente e um aro de contas.
const ESTRELAS = Array.from({ length: 10 }, (_, k) => {
  const angulo = ((-90 + k * 36) * Math.PI) / 180;
  return caminhoEstrela(100 + 19.5 * Math.cos(angulo), 144 + 19.5 * Math.sin(angulo), 3.7, 1.5);
});
const CONTAS = Array.from({ length: 32 }, (_, i) => {
  const angulo = (i / 32) * Math.PI * 2;
  return [arredondar(100 + 29 * Math.cos(angulo)), arredondar(144 + 29 * Math.sin(angulo))];
});
const MALHA: [number, number][] = [];
for (let linha = 0; linha < 6; linha++) {
  for (let x = 104 + (linha % 2) * 1.65; x <= 131; x += 3.3) MALHA.push([arredondar(x), arredondar(52 + linha * 3.3)]);
}

const ARCOS = ['M26 194 C15 160 15 122 44 103 C60 92 76 88 92 86', 'M174 194 C185 160 185 122 156 103 C140 92 124 88 108 86'];
const RUBIS = [
  [17.5, 112],
  [18.5, 139],
  [25.5, 164],
  [182.5, 112],
  [181.5, 139],
  [174.5, 164],
  [44, 205],
  [64, 207.5],
  [136, 207.5],
  [156, 205],
];
const BRACOS = [0, 72, 144, 216, 288];

function Espada({ transform }: { transform: string }) {
  return (
    <g transform={transform} fill="none" stroke={ANIL} strokeWidth="1.3" strokeLinejoin="round">
      <path d="M-3.6 43 H3.6 L3 240 L0 256 L-3 240 Z" fill={ACO} />
      <path d="M0 47 V236" strokeWidth=".8" opacity=".55" />
      <rect x="-3.1" y="10" width="6.2" height="29" rx="2.4" fill={OURO} />
      <path d="M-3 14.5 L3 18 M-3 20 L3 23.5 M-3 25.5 L3 29 M-3 31 L3 34.5" strokeWidth=".9" />
      <path d="M-21 38.6 H21 V43.4 H-21 Z" fill={OURO} />
      <circle cx="-23" cy="41" r="3.3" fill={OURO} />
      <circle cx="23" cy="41" r="3.3" fill={OURO} />
      <circle cx="0" cy="5.4" r="4.7" fill={OURO} />
      <circle cx="0" cy="-0.4" r="1.9" fill={OURO} />
    </g>
  );
}

/** Emblema completo, em cores. Fica legível a partir de uns 40px de largura. */
export function Emblema({ className }: { className?: string }) {
  return (
    <svg viewBox="0 -2 200 260" className={className} role="img" aria-label="Emblema da Ordem DeMolay">
      <Espada transform="translate(3 47) rotate(-40.9)" />
      <Espada transform="translate(197 47) rotate(40.9)" />

      {/* Coroa: veludo, arcos de ouro e aro com os dez rubis */}
      <path
        d="M19 196 C5 162 4 118 38 96 C60 82 82 79 100 79 C118 79 140 82 162 96 C196 118 195 162 181 196 Z"
        fill={RUBI}
        stroke={ANIL}
        strokeWidth="1.6"
      />
      <g fill="none" strokeLinecap="round">
        {ARCOS.map((d) => (
          <g key={d}>
            <path d={d} stroke={ANIL} strokeWidth="15" />
            <path d={d} stroke={OURO} strokeWidth="12" />
            <path d={d} stroke={OURO_SOMBRA} strokeWidth="1" strokeDasharray="1.6 3.2" />
          </g>
        ))}
      </g>
      <path d="M21 180 Q100 197 179 180 L181 190 Q100 208 19 190 Z" fill={RUBI} stroke={ANIL} strokeWidth="1.3" />
      <path d="M28 186 Q100 202 172 186" fill="none" stroke={OURO} strokeWidth="1.6" strokeDasharray="2 4" strokeLinecap="round" />
      <path d="M15 189 Q100 207 185 189 L183 214 Q100 234 17 214 Z" fill={OURO} stroke={ANIL} strokeWidth="1.6" />
      <path d="M17 210 Q100 229 183 210" fill="none" stroke={OURO_SOMBRA} strokeWidth="1.2" />
      {RUBIS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="5.7" fill={RUBI} stroke={ANIL} strokeWidth="1.3" />
          <circle cx={x - 1.7} cy={y - 1.8} r="1.5" fill="#fff" opacity=".55" />
        </g>
      ))}
      <path d="M100 202 L106 209.5 L100 217 L94 209.5 Z" fill="#fff" stroke={ANIL} strokeWidth="1.3" />

      {/* Elmo de perfil, com crista, viseira e cota de malha */}
      <g stroke={ANIL} strokeWidth="1.5" strokeLinejoin="round">
        <path
          d="M100 9 C122 3 145 16 149 40 C152 58 147 74 137 82 C129 88 119 83 121 76 C123 70 131 70 132 76 C136 66 137 52 133 40 C129 28 118 19 104 17 Z"
          fill={OURO}
        />
        <path d="M110 11.5 C127 13 140 26 143 44 C145 56 143 66 138 73 M118 13 C131 18 138 30 139 42" fill="none" strokeWidth=".9" />
        <path d="M84 64 C94 72 118 74 134 68 C140 74 144 82 143 92 L64 92 C64 80 72 70 84 64 Z" fill={OURO} />
        <path d="M74 84 C90 78 118 78 136 82" fill="none" strokeWidth=".9" />
        <path d="M100 48 L133 44 L135 70 C121 76 103 74 91 66 Z" fill={OURO} />
        <g fill={ANIL} stroke="none">
          {MALHA.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r=".72" />
          ))}
        </g>
        <path d="M85 34 C85 20 96 11 110 11 C125 11 135 22 135 37 L134 48 L104 51 L87 46 Z" fill={OURO} />
        <path
          d="M87 23 C93 12 102 7 112 7 C123 7 132 13 136 22 L132.6 24 C129 17 121.6 12.6 112 12.6 C103 12.6 96 16.6 91.4 24.6 Z"
          fill={OURO}
        />
        <path
          d="M93.6 17 L91.8 14.6 M98.6 13.8 L97.4 11 M104.4 12 L103.8 9 M110.4 11.4 L110.4 8.4 M116.4 11.8 L117.2 8.8 M122 13.2 L123.6 10.4 M127 15.8 L129 13.4"
          fill="none"
          strokeWidth=".85"
          strokeLinecap="round"
        />
        <path
          d="M91 20 L72 25.5 C69 26.5 67 28.6 67 31.6 L67 48.6 C67 51.4 68.8 53.6 71.6 54.4 L89 58.6 C96 57.6 104 53.6 111 45.6 L111 35.6 C106.6 27.6 99 21.4 91 20 Z"
          fill={OURO}
        />
        <path d="M72 33.6 L99 31.4 M72 40 L101 39 M72 46.4 L99 46.4" fill="none" strokeWidth="2.3" strokeLinecap="round" />
        <path d="M71.6 54.4 L89 58.6 L98 66 L84.6 70.6 C78 66.6 73.6 61 71.6 54.4 Z" fill={OURO} />
        <circle cx="114.2" cy="40.6" r="3.3" fill={OURO} />
        <circle cx="114.2" cy="40.6" r="1" fill={ANIL} stroke="none" />
      </g>

      {/* Cruz branca de cinco braços, com pérolas nas pontas */}
      {BRACOS.map((angulo) => (
        <g key={angulo} transform={`translate(100 144) rotate(${angulo})`}>
          <path d="M0 0 L-25 -58 L0 -45.5 L25 -58 Z" fill="#fff" stroke={ANIL} strokeWidth="1.6" />
          <path d="M-5.5 -22 L-19.6 -52.6 L0 -42.5 L19.6 -52.6 L5.5 -22" fill="none" stroke={OURO} strokeWidth="1.7" />
          <circle cx="-25" cy="-58" r="3.1" fill="#fff" stroke={ANIL} strokeWidth="1.3" />
          <circle cx="25" cy="-58" r="3.1" fill="#fff" stroke={ANIL} strokeWidth="1.3" />
        </g>
      ))}

      {/* Medalhão: crescente e estrelas */}
      <circle cx="100" cy="144" r="33" fill={ANIL} stroke={OURO} strokeWidth="1.2" />
      <g fill={OURO}>
        {CONTAS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" />
        ))}
        {ESTRELAS.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d="M104.5 134.51 A10.5 10.5 0 1 0 108.44 150.25 A8.5 8.5 0 1 1 104.5 134.51 Z" />
      </g>
    </svg>
  );
}

/** Cruz de cinco braços com o medalhão: a versão do emblema para tamanhos pequenos. */
export function Cruz({ className, disco = false }: { className?: string; disco?: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {disco && <circle cx="60" cy="60" r="57" fill={RUBI} stroke={OURO} strokeWidth="5" />}
      {BRACOS.map((angulo) => (
        <g key={angulo} transform={`translate(60 60) rotate(${angulo})`} fill="#fff" stroke={ANIL}>
          <path d="M0 -6 L-23 -50 L0 -39 L23 -50 Z" strokeWidth="3" />
          <circle cx="-23" cy="-50" r="4.6" strokeWidth="2.4" />
          <circle cx="23" cy="-50" r="4.6" strokeWidth="2.4" />
        </g>
      ))}
      <circle cx="60" cy="60" r="22" fill={ANIL} stroke={OURO} strokeWidth="3" />
      <path d="M65.48 48.21 A13 13 0 1 0 70.8 67.23 A10.4 10.4 0 1 1 65.48 48.21 Z" fill={OURO} />
    </svg>
  );
}

/** Coroa da Juventude, usada para coroar o filme escolhido. */
export function Coroa({ className }: { className?: string }) {
  const arcos = ['M16 49 C10 37 12 24 24.5 17.5 C29 15.4 35 14.6 40 14.6', 'M64 49 C70 37 68 24 55.5 17.5 C51 15.4 45 14.6 40 14.6', 'M40 14.6 V48'];
  const rubis = [
    [14.6, 36],
    [19.4, 24],
    [65.4, 36],
    [60.6, 24],
    [40, 27],
    [40, 39],
  ];
  return (
    <svg viewBox="0 -1 80 68" className={className} aria-hidden="true">
      <g stroke={ANIL} strokeWidth="1.4" strokeLinejoin="round">
        <path d="M13 50 C5 36 8 20 23 13.5 C29 11 51 11 57 13.5 C72 20 75 36 67 50 Z" fill={RUBI} />
        <g fill="none" strokeLinecap="round">
          {arcos.map((d) => (
            <g key={d}>
              <path d={d} strokeWidth="6.6" />
              <path d={d} stroke={OURO} strokeWidth="4.4" />
            </g>
          ))}
        </g>
        {rubis.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.7" fill={RUBI} strokeWidth="1.1" />
        ))}
        <path d={caminhoEstrela(40, 7.6, 6.6, 2.7)} fill={OURO} strokeWidth="1.2" />
        <path d="M7 47 Q40 56 73 47 L72 59 Q40 68 8 59 Z" fill={OURO} />
        <circle cx="19" cy="55.4" r="3.3" fill={RUBI} strokeWidth="1.1" />
        <circle cx="61" cy="55.4" r="3.3" fill={RUBI} strokeWidth="1.1" />
        <path d="M40 54.6 L44 58.8 L40 63 L36 58.8 Z" fill="#fff" strokeWidth="1.1" />
      </g>
    </svg>
  );
}

export function Estrela({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 1.6L14.7 8.88L22.46 9.2L16.37 14.02L18.47 21.5L12 17.2L5.53 21.5L7.63 14.02L1.54 9.2L9.3 8.88Z" />
    </svg>
  );
}

export function Marca() {
  return (
    <span className="inline-flex items-center gap-3">
      <Emblema className="h-12 w-auto shrink-0 drop-shadow-[0_2px_6px_rgb(0_0_0/0.5)] sm:h-14" />
      <span className="leading-none">
        <span className="block font-ornamental text-lg font-bold text-marfim sm:text-xl">Filminhos</span>
        <span className="mt-1.5 block font-titulo text-[0.62rem] font-bold tracking-[0.42em] text-ouro uppercase">DeMolay</span>
      </span>
    </span>
  );
}
