/* eslint-disable @typescript-eslint/brace-style */

import { useUpdateEffect } from 'ahooks'
import clsx from 'clsx'
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react'
import { BoardLetterState } from '@/constants'
import { FLIP_IN, FLIP_OUT, POP_IN } from '@/constants/animations'
import styles from './index.module.scss'
import type { Alphabet } from '@/utils/types'


export interface BoardLetterRef {
  changeState: (state: BoardLetterState, animationDelay?: number) => Promise<void>
}

interface BoardLetterProps {
  letter: Alphabet | undefined
  // eslint-disable-next-line react/require-default-props
  className?: string
}


const BoardLetter = forwardRef<BoardLetterRef, BoardLetterProps>((
  {
    letter,
    className = void 0
  },
  ref
): JSX.Element => {
  const [letterState, setLetterState] = useState<BoardLetterState>(letter ? BoardLetterState.tbd : BoardLetterState.empty)

  const divRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    changeState: async (state: BoardLetterState, animationDelay?: number) => new Promise((resolve) => {
      setTimeout(async () => {
        const divEl = divRef.current
        if (!divEl) return

        await divEl.animate(FLIP_IN, {
          duration: 250,
          easing: 'ease-in'
        }).finished

        setLetterState(state)

        await divEl.animate(FLIP_OUT, {
          duration: 250,
          easing: 'ease-in'
        }).finished

        resolve()
      }, animationDelay)
    })
  }), [])

  useUpdateEffect(() => {
    // insert
    if (letter) {
      setLetterState(BoardLetterState.tbd)

      divRef.current?.animate(POP_IN, 100)
    }
    // remove
    else {
      setLetterState(BoardLetterState.empty)

      // stop any potentially playing animations
      divRef.current?.getAnimations().forEach(animation => void animation.cancel())
    }
  }, [letter])

  return (
    <div
      ref={divRef}
      aria-label="guessed letter"
      aria-roledescription="Display of guessed letter"
      className={clsx(className, styles.boardLetter)}
      data-state={letterState}
    >
      {letter}
    </div>
  )
})

BoardLetter.displayName = 'BoardLetter'
export default memo(BoardLetter)
