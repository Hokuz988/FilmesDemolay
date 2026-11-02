/*
 * Heráldica e marca da Ordem DeMolay.
 * - Emblema: o brasão tradicional (espadas cruzadas, coroa com os dez rubis, elmo,
 *   cruz branca de cinco braços e medalhão com o crescente e as estrelas).
 * - Marca: no estilo do logotipo atual da Ordem, com a fileira de estrelas e o escudo.
 */

import { Fragment } from 'react';

const VIRTUDES = [
  'Amor Filial',
  'Reverência pelas Coisas Sagradas',
  'Cortesia',
  'Companheirismo',
  'Fidelidade',
  'Pureza',
  'Patriotismo',
];

/** As sete virtudes da Ordem numa linha corrida, quebrando só entre uma virtude e outra. */
export function Virtudes({ className }: { className?: string }) {
  return (
    <p className={className}>
      {VIRTUDES.map((virtude, i) => (
        <Fragment key={virtude}>
          {i > 0 && ' '}
          <span className="whitespace-nowrap">
            {virtude}
            {i < VIRTUDES.length - 1 && ' ·'}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

// Cores do brasão (fixas, independentes do tema).
const ANIL = '#180f73';
const OURO = '#f6b40c';
const RUBI = '#c10d20';
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
const ESTRELAS_MEDALHAO = Array.from({ length: 10 }, (_, k) => {
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

/** Brasão completo, em cores. Fica legível a partir de uns 40px de largura. */
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
        {ESTRELAS_MEDALHAO.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d="M104.5 134.51 A10.5 10.5 0 1 0 108.44 150.25 A8.5 8.5 0 1 1 104.5 134.51 Z" />
      </g>
    </svg>
  );
}

const ESTRELA_PEQUENA = caminhoEstrela(0, 0.4, 5.6, 2.3);

/** Fileira de estrelas com o escudo ao centro, do logotipo da Ordem. */
export function Estrelas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 124 18" className={className} aria-hidden="true">
      <g fill="var(--color-ouro)">
        {[7, 24, 41, 83, 100, 117].map((x) => (
          <path key={x} d={ESTRELA_PEQUENA} transform={`translate(${x} 9)`} />
        ))}
      </g>
      <path d="M53 1H71V9.5C71 13.6 67 16.2 62 17.4C57 16.2 53 13.6 53 9.5Z" fill="var(--color-vermelho)" />
      <path d={caminhoEstrela(62, 8.4, 4.4, 1.8)} fill="#fff" />
    </svg>
  );
}

/** Escudo vermelho com a estrela branca. */
export function EscudoEstrela({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 36" className={className} aria-hidden="true">
      <path d="M1 1H31V17C31 26 24 32 16 35C8 32 1 26 1 17Z" fill="var(--color-vermelho)" />
      <path d={caminhoEstrela(16, 15, 8.6, 3.6)} fill="#fff" />
    </svg>
  );
}

/** Marca do app: estrelas, "DeMolay" em letra larga contornada e "Filminhos" por baixo. */
export function Marca({ claro = false, className = '' }: { claro?: boolean; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <Estrelas className="h-[0.7em] w-auto" />
      <span
        className={`contornado mt-[0.12em] font-black tracking-[0.02em] font-stretch-expanded ${claro ? 'text-white' : 'text-marinho'}`}
      >
        D<span className="text-[0.78em]">E</span>M<span className="text-[0.78em]">OLAY</span>
      </span>
      <span
        className={`mt-[0.2em] pl-[0.45em] text-[0.36em] font-extrabold tracking-[0.45em] ${claro ? 'text-ouro' : 'text-vermelho'}`}
      >
        FILMINHOS
      </span>
    </span>
  );
}
