import React, { useEffect, useState } from 'react'

import { CargillFull } from '@/components/ui/svgs/cargill'
import { TysonFull } from '@/components/ui/svgs/tyson'
import { ADMFull } from '@/components/ui/svgs/adm'
import { PurinaFull } from '@/components/ui/svgs/purina'
import { BungeFull } from '@/components/ui/svgs/bunge'
import { AlltechFull } from '@/components/ui/svgs/alltech'
import { ElancoFull } from '@/components/ui/svgs/elanco'
import { ZoetisFull } from '@/components/ui/svgs/zoetis'
import { KeminFull } from '@/components/ui/svgs/kemin'
import { BASFFull } from '@/components/ui/svgs/basf'
import { NutrecoFull } from '@/components/ui/svgs/nutreco'
import { CortevaFull } from '@/components/ui/svgs/corteva'
import { AnimatePresence, motion } from 'motion/react'

const feedProducers: React.ReactNode[] = [
    <CargillFull key="cargill" className="h-3.5 w-full" />,
    <TysonFull key="tyson" className="h-3.5 w-full" />,
    <ADMFull key="adm" className="h-3.5 w-full" />,
]

const nutritionBrands: React.ReactNode[] = [
    <PurinaFull key="purina" className="h-3.5 w-full" />,
    <BungeFull key="bunge" className="h-3.5 w-full" />,
    <AlltechFull key="alltech" className="h-3.5 w-full" />,
]

const animalHealth: React.ReactNode[] = [
    <ElancoFull key="elanco" className="h-3.5 w-full" />,
    <ZoetisFull key="zoetis" className="h-3.5 w-full" />,
    <KeminFull key="kemin" className="h-3.5 w-full" />,
]

const agriTech: React.ReactNode[] = [
    <BASFFull key="basf" className="h-3.5 w-full" />,
    <NutrecoFull key="nutreco" className="h-3.5 w-full" />,
    <CortevaFull key="corteva" className="h-3.5 w-full" />,
]

type LogoGroup = 'feedProducers' | 'nutritionBrands' | 'animalHealth' | 'agriTech'

const logos: { [key in LogoGroup]: React.ReactNode[] } = {
    feedProducers,
    nutritionBrands,
    animalHealth,
    agriTech,
}

export default function LogoCloud() {
    const [currentGroup, setCurrentGroup] = useState<LogoGroup>('feedProducers')

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentGroup((prev) => {
                const groups = Object.keys(logos) as LogoGroup[]
                const currentIndex = groups.indexOf(prev)
                const nextIndex = (currentIndex + 1) % groups.length
                return groups[nextIndex] as LogoGroup
            })
        }, 2500)

        return () => clearInterval(interval)
    }, [])

    return (
        <section className="bg-background py-12">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto grid h-8 max-w-2xl grid-cols-3 items-center gap-8">
                    <AnimatePresence
                        initial={false}
                        mode="popLayout">
                        {logos[currentGroup].map((logo, i) => (
                            <motion.div
                                key={`${currentGroup}-${i}`}
                                className="**:fill-foreground! flex items-center justify-center"
                                initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: 12, filter: 'blur(6px)', scale: 0.5 }}
                                transition={{ delay: i * 0.1, duration: 1.5, type: 'spring', bounce: 0.2 }}>
                                {logo}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}
