import type { SVGProps } from 'react'

const Cargill = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Cargill</text>
    </svg>
)

const CargillFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Cargill</text>
    </svg>
)

export { Cargill, CargillFull }
