'use client'

import { useEffect, useRef, useState } from 'react'

export type EntranceAnimation =
  | 'none'
  | 'fade'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'scale'

export type HoverAnimation = 'none' | 'lift' | 'scale' | 'glow'

interface Props {
  index: number
  children: React.ReactNode
  /** Extra classes on the wrapping div — used by grid layouts for col-span. */
  className?: string
  /**
   * Theme-driven entrance animation. Driven by IntersectionObserver so the
   * effect fires when the block crosses into the viewport, not just on
   * initial mount — closes the "Portaly feels alive while Beam doesn't"
   * gap. 'none' opts the whole profile out (still respects user's
   * prefers-reduced-motion regardless via CSS).
   */
  animation?: EntranceAnimation
  /**
   * Theme-driven hover effect (lift / scale / glow). Stacks on top of any
   * intrinsic block hover behaviour (e.g. LinkBlock's bounce). Default
   * 'lift' so every page gets some response when the user mouses over a
   * card, not the previous static-stone feel.
   */
  hover?: HoverAnimation
}

/**
 * AnimatedBlock — wraps each public-page block to fade/slide/scale it in
 * once the user scrolls it into view. Uses IntersectionObserver instead of
 * a one-shot mount-time setTimeout so blocks below the fold get their
 * animation when reached, not at SSR time when they're invisible anyway.
 *
 * The class-based animation primitives are defined in globals.css; we just
 * toggle `.is-visible` here. That keeps the animation policy (timings,
 * curves, prefers-reduced-motion handling) co-located with other CSS.
 *
 * Stagger: when blocks are already in view at first render (above the fold),
 * we still apply a small index-based delay so they cascade visually instead
 * of slamming in together.
 */
export function AnimatedBlock({ index, children, className, animation = 'slide-up', hover = 'lift' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (animation === 'none') {
      // Skip the observer entirely — the element renders fully visible from
      // the start. Don't wire an observer just to immediately disconnect it.
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return

    // Bail out if the browser doesn't support IntersectionObserver (very
    // old browsers, SSR replay edge cases). Show the element immediately
    // rather than leaving it stuck invisible.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Stagger above-the-fold blocks so they cascade rather than
            // pop in simultaneously. 60ms × index keeps the total cascade
            // under ~0.5s for the first 8 blocks.
            const delay = index * 60
            const t = setTimeout(() => setVisible(true), delay)
            observer.disconnect()
            // Capture the timer so the cleanup can clear it if the block
            // unmounts mid-stagger.
            ;(el as HTMLElement & { _entranceTimer?: ReturnType<typeof setTimeout> })._entranceTimer = t
          }
        }
      },
      // 12% visible is enough to trigger — any sooner and the animation
      // can finish before the user notices the block existed.
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      const timer = (el as HTMLElement & { _entranceTimer?: ReturnType<typeof setTimeout> })._entranceTimer
      if (timer) clearTimeout(timer)
    }
  }, [animation, index])

  // Compose the class: base (for the resting hidden state) + is-visible
  // when triggered. The CSS file owns what `block-anim-slide-up` etc. mean.
  const animClass = animation !== 'none' ? `block-anim-${animation}` : ''
  const hoverClass = hover !== 'none' ? `block-hover-${hover}` : ''
  const visibleClass = visible ? 'is-visible' : ''
  const composed = [className, animClass, hoverClass, visibleClass].filter(Boolean).join(' ')

  return (
    <div ref={ref} className={composed}>
      {children}
    </div>
  )
}
