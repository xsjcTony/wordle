/* eslint-disable react/no-array-index-key */
/* eslint-disable react-hooks/exhaustive-deps */

import { useAsyncEffect } from 'ahooks'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import BoardLetter from '@/components/BoardLetter'
import { BoardLetterState, GameStatus, WORD_LENGTH } from '@/constants'
import { SHAKE } from '@/constants/animations'
import useGameState from '@/store/useGameState'
import { compareFlatArray, validateWord } from '@/utils'
import evaluateWord from '@/utils/evaluation'
import styles from './index.module.scss'
import type { BoardLetterRef } from '@/components/BoardLetter'
import type { Alphabet } from '@/utils/types'


/**
 * Types
 */
interface BoardRowProps {
  rowIndex: number
}


/**
 * Component
 */
const BoardRow = ({ rowIndex }: BoardRowProps): JSX.Element => {
  const {
    currentWord,
    currentRowIndex,
    evaluating,
    stopEvaluating,
    solution,
    setEvaluationResult,
    setGameStatus
  } = useGameState((state) => {
    const { currentWord, currentRowIndex, evaluating, stopEvaluating, solution, setEvaluationResult, setGameStatus } = state

    return { currentWord, currentRowIndex, evaluating, stopEvaluating, solution, setEvaluationResult, setGameStatus }
  })


  const initialWord = useGameState.getState().boardState[rowIndex] // 5-letter word or '' (empty string)
  // @ts-expect-error only Alphabet 5-letter word will be stored into boardState
  const [word, setWord] = useState<Alphabet[]>(initialWord.split(''))
  const [win, setWin] = useState<boolean>(false)


  const rowRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-extra-parens
  const letterRefs = useRef<(BoardLetterRef | null)[]>([])
  const getLetterRefs = useCallback((ref: BoardLetterRef | null) => {
    if (letterRefs.current.length === WORD_LENGTH) {
      letterRefs.current = []
    }
    letterRefs.current.push(ref)
  }, [])


  useEffect(() => void (rowIndex === currentRowIndex && setWord(currentWord)), [currentWord])


  // evaluate word: Animation + GameState update
  const _validateWord = useCallback(async (condition: boolean, message: string): Promise<boolean> => {
    if (condition) {
      toast(message)
      await rowRef.current?.animate(SHAKE, 600).finished
      stopEvaluating()
    }

    return condition
  }, [])

  useAsyncEffect(async () => {
    if (
      rowIndex !== currentRowIndex
      || !evaluating
      || await _validateWord(word.length !== WORD_LENGTH, 'Not enough letters')
      || await _validateWord(!validateWord(word), 'Not in word list')
    ) return

    const evaluationResult = evaluateWord(word, solution)

    for (let i = 0; i < letterRefs.current.length; i++) {
      await letterRefs.current[i]?.changeState(evaluationResult[i])
    }

    if (compareFlatArray(evaluationResult, new Array(WORD_LENGTH).fill(BoardLetterState.correct))) {
      setGameStatus(GameStatus.win)

      setWin(true)
      setTimeout(() => {
        setWin(false)
      }, 2000) // should be 1400, but in case of client lagging
    }

    setEvaluationResult(word, evaluationResult)
  }, [evaluating])


  return (
    <div ref={rowRef} className={styles.boardRow}>
      {new Array(WORD_LENGTH).fill(void 0).map((_, i) => (
        <div
          key={i}
          className={clsx(styles.boardLetterContainer, win && styles.boardRowWin)}
          style={{ '--delay': `.${i}s` }}
        >
          <BoardLetter ref={getLetterRefs} letter={word[i]} />
        </div>
      ))}
    </div>
  )
}

export default BoardRow
