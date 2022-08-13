import clsx from 'clsx'
import styles from './index.module.scss'
import type { ReactElement } from 'react'


interface KeyProps {
  keyText: ReactElement | string
  wide?: boolean
}


const Key = ({ keyText, wide = false }: KeyProps): JSX.Element => (
  <button className={clsx(styles.keyboardKey, wide && styles.wide)}>
    {
      typeof keyText === 'string'
        ? keyText.toUpperCase()
        : keyText
    }
  </button>
)

export default Key
