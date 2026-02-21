import type { SVGProps } from 'react'

const Alltech = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 22h20L12 2zm0 5l6.5 13h-13L12 7z" fill="currentColor" />
    </svg>
)

const AlltechFull = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 120 24" fill="none">
        <text x="0" y="18" fontFamily="Inter, system-ui, sans-serif" fontWeight="700" fontSize="18" fill="currentColor">Alltech</text>
    </svg>
)

export { Alltech, AlltechFull }
