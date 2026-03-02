'use client';
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { FaMagnifyingGlass } from 'react-icons/fa6';


const TopNavbar = () => {
    const pathname = usePathname()
    const [path, setPath] = useState(pathname.substring(1, pathname.length))
    // useEffect(()=>{
    //     let temp = ""
    //     for (let c of pathname){
    //         if (c !== "/"){
    //             temp+= c;
    //         }
            
    //     }
    //     setPath(temp);
    // }, [pathname])
  return (
    <nav className='sticky w-screen p-4 '>
        <section className='flex justify-between '>
            <div className='flex gap-4'>

            <button className='flex text-xl justify-center items-center'><FaBars/></button>
            <div className='capitalize text-2xl font-bold text-primary-dark'>{path}</div>
            </div>
            <button onClick={()=> {
              console.log("search listings")
            }} className=' flex justify-center items-center'><FaMagnifyingGlass/></button>
        </section>
    </nav>
  )
}

export default TopNavbar