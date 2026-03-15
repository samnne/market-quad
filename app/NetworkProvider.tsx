'use client'
import { useCallback, useContext, useEffect, useState, createContext } from "react"


const NetworkContext = createContext(null);
export const NetworkProvider = ({children} : {children: React.ReactNode})=>{
    const [isOnline, setOnline] = useState<boolean>(() : boolean =>{
        return navigator.onLine
    })
		const setOnlineToTrue = useCallback(() =>{
        setOnline(true)
    }, [])
    const setOnlineToFalse = useCallback(()=>{
        setOnline(false)
    }, [])

    useEffect(()=>{
        window.addEventListener('online', setOnlineToTrue)
        window.addEventListener('offline', setOnlineToFalse)
        return ()=>{
            window.removeEventListener('online', setOnlineToTrue)
            window.removeEventListener('offline', setOnlineToFalse)
        }
    }, [setOnlineToTrue,setOnlineToFalse ])

    return <NetworkContext.Provider value={{isOnline}}>
					{children}
				</NetworkContext.Provider>
}

export const useNetworkCheck = ()=>{
    const context = useContext(NetworkContext);
    if(!!!context){
        throw Error("useNetworkCheck must be inside of NetworkProvider");
    }
    return context;
}