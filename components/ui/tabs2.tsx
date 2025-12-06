'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

type Tab = {
  content?: any | React.ReactNode | string;
  title: string;
  value: string;
};

export const Tabs = ({
  activeTabClassName,
  containerClassName,
  contentClassName,
  tabClassName,
  tabs: propertyTabs,
}: {
  readonly activeTabClassName?: string;
  readonly containerClassName?: string;
  readonly contentClassName?: string;
  readonly tabClassName?: string;
  readonly tabs: Tab[];
}) => {
  const [active, setActive] = useState<Tab>(propertyTabs[0]);
  const [tabs, setTabs] = useState<Tab[]>(propertyTabs);

  const moveSelectedTabToTop = (index: number) => {
    const newTabs = [...propertyTabs];
    const selectedTab = newTabs.splice(index, 1);
    newTabs.unshift(selectedTab[0]);
    setTabs(newTabs);
    setActive(newTabs[0]);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          'flex flex-row items-center justify-start mt-0 [perspective:1000px] relative overflow-auto sm:overflow-visible no-visible-scrollbar border-x w-full border-t max-w-max bg-transparent',
          containerClassName,
        )}
      >
        {propertyTabs.map((tab, index) => (
          <button
            className={cn(
              'relative px-4 py-2 rounded-full opacity-80 hover:opacity-100',
              tabClassName,
            )}
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(index);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {active.value === tab.value && (
              <motion.div
                animate={{
                  x: tabs.indexOf(tab) === 0 ? [0, 0, 0] : [0, 0, 0],
                }}
                className={cn(
                  'absolute inset-0 bg-gray-200 dark:bg-zinc-900/90 opacity-100',
                  activeTabClassName,
                )}
                transition={{
                  delay: 0.1,
                  duration: 0.2,

                  type: 'keyframes',
                }}
              />
            )}

            <span
              className={cn(
                'relative block text-black dark:text-white',
                active.value === tab.value
                  ? 'opacity-100 font-medium'
                  : 'opacity-40 ',
              )}
            >
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <FadeInDiv
        active={active}
        className={cn('', contentClassName)}
        hovering={hovering}
        key={active.value}
        tabs={tabs}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
}: {
  readonly active: Tab;
  readonly className?: string;
  readonly hovering?: boolean;
  readonly key?: string;
  readonly tabs: Tab[];
}) => {
  const isActive = (tab: Tab) => {
    return tab.value === tabs[0].value;
  };

  return (
    <div className="relative w-full h-full">
      {tabs.map((tab, index) => (
        <motion.div
          animate={{
            transition: {
              delay: 0.1,
              duration: 0.2,
              type: 'keyframes',
            },
          }}
          className={cn(
            'w-full h-full',
            isActive(tab) ? '' : 'hidden',
            className,
          )}
          key={tab.value}
          style={{
            opacity: index < 3 ? 1 - index * 0.1 : 0,
            scale: 1 - index * 0.1,
            zIndex: -index,
          }}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};
