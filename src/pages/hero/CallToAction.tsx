import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

export default function CallToAction() {
    return (
        <section className="bg-background @container py-24">
            <div className="mx-auto max-w-2xl px-6">
                <div className="text-center">
                    <h2 className="text-balance font-serif text-4xl font-medium">Ready to Get Started?</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-md text-balance">Join teams already using CleanFeed to build healthier, more efficient feed operations.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button
                            asChild
                            className="pr-1.5">
                            <Link to="/login">
                                <span>Start Free Trial</span>
                                <ChevronRight className="opacity-50" />
                            </Link>
                        </Button>
                        <Button
                            variant="secondary"
                            asChild>
                            <Link to="/login">Talk to Sales Now</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
