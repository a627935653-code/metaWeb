import React, { useCallback, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { pageIsMobileAtom } from '@/store/main'

function PageAtomCom() {
    const setPageIsMobile = useSetAtom(pageIsMobileAtom)

    const setDomClientWidthCall = useCallback((width: number) => {
        setPageIsMobile(width <= 640)
    }, [])

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (window) {
            timer = setTimeout(() => {
                let contentWidth = document.documentElement.clientWidth || document.body.clientWidth
                setDomClientWidthCall(contentWidth)
                window.addEventListener('resize', () => {
                    contentWidth = document.documentElement.clientWidth || document.body.clientWidth
                    setDomClientWidthCall(contentWidth)
                })
            }, 200)
        }
        return () => {
            clearTimeout(timer)
        }
    }, [])
    return null
}
export default React.memo(PageAtomCom)
