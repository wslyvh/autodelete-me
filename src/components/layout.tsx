import React, { ReactNode } from 'react'
import { Link } from './link'

type Props = {
    children: ReactNode
}

export default function Layout(props: Props) {
    return (
        <div>
            <header>
                <h1 className="text-xl font-bold">
                    Twitter Purge
                </h1>
            </header>

            <main>{props.children}</main>

            <footer>by <Link href='https://twitter.com/wslyvh'>@wslyvh</Link> | Code on <Link href='https://github.com/wslyvh/twitter-purge'>Github</Link></footer>
        </div>
    )
}
