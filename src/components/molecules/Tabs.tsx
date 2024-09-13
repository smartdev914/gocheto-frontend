import React, { FC } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ITab {
  label: string;
  href: string;
}

interface ITabs {
  tabs: ITab[];
}

export const Tabs: FC<ITabs> = ({ tabs }) => {
  const pathname = usePathname();
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`}}
      className='p-2 rounded-full gap-1 w-max bg-gray-800 hidden md:grid'
    >
      {tabs.map((tab, index) => {
        if (pathname?.startsWith(`/${tab.href.split('/')[1]}`)) {
          return (
            <p
              key={index}
              style={{ backgroundColor: '#191C27' }}
              className={'text-sm font-semibold text-white px-3 py-1 rounded-full text-center cursor-pointer'}
            >
              {tab.label}
            </p>
          )
        }

        return (
          <Link
            key={index}
            href={tab.href}
            className={`text-sm font-semibold text-white px-3 py-1 rounded-full text-center  cursor-pointer hover:bg-gray-700`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}

export default Tabs
