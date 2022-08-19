import LoginButton from 'components/login'
import Link from 'next/link'
import { DESCRIPTION } from 'utils/constants'

export default function Home() {
  return <>
    <p>
      {DESCRIPTION}
    </p>
    <p>
      <LoginButton />
    </p>
  </>
}
