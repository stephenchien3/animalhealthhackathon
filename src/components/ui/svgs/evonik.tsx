import type { SVGProps } from 'react'

const Evonik = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 110 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Evonik</text>
    </svg>
)

const EvonikFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 110 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Evonik</text>
    </svg>
)

export { Evonik, EvonikFull }
