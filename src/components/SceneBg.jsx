/**
 * Reusable SVG scene backgrounds for each page.
 * variant: 'mountains' | 'forest' | 'lake' | 'snow' | 'shield'
 */
export default function SceneBg({ variant = 'mountains' }) {
  if (variant === 'mountains') return <MountainsBg />
  if (variant === 'forest') return <ForestBg />
  if (variant === 'lake') return <LakeBg />
  if (variant === 'snow') return <SnowBg />
  if (variant === 'shield') return <ShieldBg />
  return null
}

function MountainsBg() {
  return (
    <svg viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="scene-svg">
      <defs>
        <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#m-sky)" />

      {/* Clouds */}
      <ellipse cx="180" cy="40" rx="70" ry="18" fill="white" opacity="0.5" />
      <ellipse cx="230" cy="35" rx="45" ry="14" fill="white" opacity="0.4" />
      <ellipse cx="750" cy="30" rx="55" ry="16" fill="white" opacity="0.45" />
      <ellipse cx="1000" cy="45" rx="50" ry="14" fill="white" opacity="0.35" />

      {/* Birds */}
      <path d="M280,55 Q285,49 290,55 Q295,49 300,55" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.35" />
      <path d="M310,45 Q314,40 318,45 Q322,40 326,45" stroke="#94a3b8" strokeWidth="1.2" fill="none" opacity="0.25" />
      <path d="M850,40 Q854,35 858,40 Q862,35 866,40" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.3" />

      {/* Far mountains - snow capped */}
      <polygon points="0,280 60,100 140,160 240,60 340,130 440,70 540,140 640,90 740,150 840,75 940,120 1040,80 1120,130 1200,100 1200,280" fill="#94a3b8" opacity="0.25" />
      <polygon points="225,70 240,60 255,70 250,67 230,67" fill="white" opacity="0.7" />
      <polygon points="425,80 440,70 455,80 450,77 430,77" fill="white" opacity="0.7" />
      <polygon points="825,85 840,75 855,85 850,82 830,82" fill="white" opacity="0.7" />
      <polygon points="1025,90 1040,80 1055,90 1050,87 1030,87" fill="white" opacity="0.7" />

      {/* Mid mountains */}
      <polygon points="0,320 100,200 200,240 300,180 400,220 500,190 600,230 700,200 800,240 900,210 1000,240 1100,220 1200,250 1200,320" fill="#64748b" opacity="0.15" />

      {/* Near foothills */}
      <polygon points="0,360 80,270 180,300 280,260 380,290 480,270 580,300 680,280 780,305 880,285 980,310 1080,290 1200,310 1200,360" fill="#0d9488" opacity="0.1" />

      {/* Ground */}
      <rect y="330" width="1200" height="70" fill="#dcfce7" opacity="0.3" />

      {/* Cedar trees */}
      {[60, 160, 290, 400, 530, 660, 770, 880, 1000, 1100].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${335 - (i % 2) * 6})`} opacity={0.2 + (i % 3) * 0.05}>
          <rect x="-2" y={-3} width="4" height={14} fill="#1a4a2e" rx="1" />
          <polygon points={`0,${-38 - (i%3)*10} ${-12 - (i%3)*2},-6 ${12 + (i%3)*2},-6`} fill="#15803d" />
          <polygon points={`0,${-28 - (i%3)*8} ${-9 - (i%2)*2},-1 ${9 + (i%2)*2},-1`} fill="#16a34a" />
          <polygon points={`0,${-20 - (i%3)*5} -7,5 7,5`} fill="#22c55e" />
        </g>
      ))}

      {/* Deer */}
      <g transform="translate(620, 328) scale(0.5)" opacity="0.15">
        <path d="M0,0 C2,-8 8,-12 10,-20 L12,-18 L14,-24 L15,-18 L18,-14 C20,-8 18,0 16,2 L20,2 L20,12 L17,12 L17,6 L12,4 L8,6 L8,12 L5,12 L5,2 L2,2 Z" fill="#1a4a2e" />
      </g>

      <text x="600" y="385" textAnchor="middle" fontFamily="'Segoe UI', sans-serif" fontSize="10" fill="#94a3b8" letterSpacing="4" opacity="0.4">PROTECTING THE ATLAS MOUNTAINS · IFRANE REGION</text>
    </svg>
  )
}

function ForestBg() {
  return (
    <svg viewBox="0 0 1200 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="scene-svg">
      <defs>
        <linearGradient id="f-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f0fdf4" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="1200" height="350" fill="url(#f-sky)" />

      {/* Rolling hills */}
      <ellipse cx="300" cy="320" rx="400" ry="80" fill="#dcfce7" opacity="0.4" />
      <ellipse cx="900" cy="330" rx="450" ry="70" fill="#d1fae5" opacity="0.3" />

      {/* Dense cedar forest */}
      {Array.from({length: 25}, (_, i) => {
        const x = 30 + i * 48
        const h = 50 + (i % 4) * 15
        const y = 290 - (i % 3) * 10 - Math.sin(i * 0.8) * 8
        return (
          <g key={i} transform={`translate(${x}, ${y})`} opacity={0.15 + (i % 4) * 0.04}>
            <rect x="-3" y={-4} width="6" height={18} fill="#1a4a2e" rx="1" />
            <polygon points={`0,${-h} ${-14 - (i%3)*3},-8 ${14 + (i%3)*3},-8`} fill="#15803d" />
            <polygon points={`0,${-h+12} ${-11 - (i%2)*2},-2 ${11 + (i%2)*2},-2`} fill="#16a34a" />
            <polygon points={`0,${-h+22} ${-8},6 ${8},6`} fill="#22c55e" />
          </g>
        )
      })}

      {/* Mushrooms */}
      <g transform="translate(200, 300)" opacity="0.15">
        <rect x="-1.5" y="0" width="3" height="8" fill="#92400e" rx="1" />
        <ellipse cx="0" cy="0" rx="6" ry="4" fill="#dc2626" />
        <circle cx="-2" cy="-1" r="1" fill="white" opacity="0.8" />
        <circle cx="2" cy="0" r="0.8" fill="white" opacity="0.8" />
      </g>
      <g transform="translate(850, 310)" opacity="0.12">
        <rect x="-1" y="0" width="2.5" height="6" fill="#92400e" rx="1" />
        <ellipse cx="0" cy="0" rx="5" ry="3" fill="#dc2626" />
      </g>

      {/* Birds */}
      <path d="M400,80 Q405,74 410,80 Q415,74 420,80" stroke="#64748b" strokeWidth="1.5" fill="none" opacity="0.25" />
      <path d="M700,60 Q704,55 708,60 Q712,55 716,60" stroke="#64748b" strokeWidth="1.2" fill="none" opacity="0.2" />

      <text x="600" y="338" textAnchor="middle" fontFamily="'Segoe UI', sans-serif" fontSize="10" fill="#94a3b8" letterSpacing="4" opacity="0.35">REPORT AN ENVIRONMENTAL ISSUE · HELP PROTECT IFRANE</text>
    </svg>
  )
}

function LakeBg() {
  return (
    <svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="scene-svg">
      <defs>
        <linearGradient id="l-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ecfeff" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0891b2" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#l-sky)" />

      {/* Mountains reflection backdrop */}
      <polygon points="200,140 350,80 500,120 650,70 800,110 950,85 1050,100 1200,130 1200,180 0,180 0,140 100,150" fill="#94a3b8" opacity="0.12" />

      {/* Lake */}
      <ellipse cx="600" cy="220" rx="500" ry="55" fill="url(#lake)" />

      {/* Water ripples */}
      {[350, 480, 600, 720, 850].map((x, i) => (
        <ellipse key={i} cx={x} cy={220 + (i%2)*5} rx={30 + i*3} ry={2} fill="#06b6d4" opacity={0.08 + i*0.01} />
      ))}

      {/* Shoreline trees */}
      {[100, 200, 1000, 1100].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${195 - (i%2)*5})`} opacity="0.2">
          <rect x="-2" y={-3} width="4" height={12} fill="#1a4a2e" rx="1" />
          <polygon points="0,-35 -10,-5 10,-5" fill="#15803d" />
          <polygon points="0,-25 -8,0 8,0" fill="#22c55e" />
        </g>
      ))}

      <text x="600" y="285" textAnchor="middle" fontFamily="'Segoe UI', sans-serif" fontSize="10" fill="#94a3b8" letterSpacing="4" opacity="0.35">TRACK YOUR REPORT · DAYET AOUA LAKE REGION</text>
    </svg>
  )
}

function SnowBg() {
  return (
    <svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="scene-svg">
      <defs>
        <linearGradient id="s-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#s-sky)" />

      {/* Snowy mountains */}
      <polygon points="0,220 150,80 300,150 450,60 600,120 750,70 900,130 1050,90 1200,150 1200,220" fill="#cbd5e1" opacity="0.2" />
      <polygon points="135,90 150,80 165,90 160,87 140,87" fill="white" opacity="0.5" />
      <polygon points="435,70 450,60 465,70 460,67 440,67" fill="white" opacity="0.5" />
      <polygon points="735,80 750,70 765,80 760,77 740,77" fill="white" opacity="0.5" />

      {/* Snowflakes */}
      {Array.from({length: 30}, (_, i) => (
        <circle key={i} cx={40 + i * 40} cy={30 + (i * 37) % 180} r={1 + i % 2} fill="#94a3b8" opacity={0.1 + (i % 3) * 0.05} />
      ))}

      {/* Snow-covered ground */}
      <rect y="240" width="1200" height="60" fill="white" opacity="0.3" />
      <ellipse cx="300" cy="245" rx="200" ry="15" fill="white" opacity="0.2" />
      <ellipse cx="800" cy="248" rx="250" ry="12" fill="white" opacity="0.15" />

      <text x="600" y="285" textAnchor="middle" fontFamily="'Segoe UI', sans-serif" fontSize="10" fill="#94a3b8" letterSpacing="4" opacity="0.35">SECURE ACCESS · AUTHORITY PORTAL</text>
    </svg>
  )
}

function ShieldBg() {
  return (
    <svg viewBox="0 0 1200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="scene-svg">
      <rect width="1200" height="200" fill="#f8fafc" opacity="0.5" />
      {/* Subtle shield pattern */}
      {[150, 400, 650, 900, 1100].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${80 + (i%2)*20})`} opacity={0.04 + (i%3)*0.01}>
          <path d="M0,-40 L30,-25 L30,10 Q30,35 0,50 Q-30,35 -30,10 L-30,-25 Z" fill="#0d9488" />
        </g>
      ))}
    </svg>
  )
}
