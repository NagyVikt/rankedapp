// components/sidebar/SidebarComponent.tsx
'use client';

import React, { useState, useCallback, forwardRef } from 'react';
import {
  Listbox,
  ListboxItem,
  Accordion,
  AccordionItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@heroui/react';
import { items, SidebarItem, SidebarItemType } from './sidebar-items';

// pull in the exact Key & Selection types the Listbox uses
import type { Key as SharedKey, Selection } from '@react-types/shared';

export type SidebarProps = {
  isCompact?: boolean;
  hideEndContent?: boolean;
  iconClassName?: string;
  classNames?: Record<string, string>;
};

const SidebarComponent = forwardRef<HTMLElement, SidebarProps>(
  (
    { isCompact = false, hideEndContent = false, iconClassName, classNames },
    ref
  ) => {
    const router = useRouter();
    const pathname = usePathname();

    // the ListboxItem.key in your items is a string, so treat it as SharedKey
    const defaultKey = (items.find((it) => it.href && pathname.startsWith(it.href))
      ?.key ?? items[0].key) as SharedKey;

    // now selected is a SharedKey
    const [selected, setSelected] = useState<SharedKey>(defaultKey);

    // onSelectionChange expects a Selection (Key or Iterable<Key> or "all")
    const onSelChange = useCallback(
      (keys: Selection) => {
        // Normalize to an array of SharedKey
        let chosen: SharedKey;
        if (keys === 'all') {
          chosen = defaultKey;
        } else if (typeof keys === 'string' || typeof keys === 'number') {
          chosen = keys as SharedKey;
        } else {
          // Iterable<Key>
          chosen = (Array.from(keys)[0] ?? defaultKey) as SharedKey;
        }

        setSelected(chosen);
        const item = items.find((i) => (i.key as SharedKey) === chosen);
        if (item?.href) {
          router.push(item.href);
        }
      },
      [router, defaultKey]
    );

    const renderItem = useCallback(
      (item: SidebarItem) => {
        // strip out key before spreading
        const { key: itemKey, ...itemProps } = item;
        return (
          <ListboxItem
            key={itemKey}
            {...itemProps}
            endContent={
              isCompact || hideEndContent ? null : item.endContent
            }
            startContent={
              isCompact
                ? null
                : item.icon && (
                    <Icon
                      icon={item.icon}
                      width={24}
                      className={cn(
                        'text-default-500 group-data-[selected=true]:text-foreground',
                        iconClassName
                      )}
                    />
                  )
            }
            textValue={item.title}
            title={isCompact ? null : item.title}
          >
            {isCompact && item.icon ? (
              <div className="flex w-full items-center justify-center">
                <Icon icon={item.icon} width={24} className={iconClassName} />
              </div>
            ) : null}
          </ListboxItem>
        );
      },
      [isCompact, hideEndContent, iconClassName]
    );

    const renderNest = useCallback(
      (item: SidebarItem) => (
        <Accordion key={item.key} className="p-0">
          <AccordionItem
            aria-label={item.title}
            title={
              <div className="flex items-center gap-2 p-2">
                {item.icon && (
                  <Icon
                    icon={item.icon}
                    width={24}
                    className={iconClassName}
                  />
                )}
                <span>{item.title}</span>
              </div>
            }
            classNames={{ trigger: 'p-0', content: 'pl-4' }}
          >
            <Listbox
              hideSelectedIcon
              variant="flat"
              items={item.items!}
              // pass the single selected key inside an iterable
              selectedKeys={new Set([selected])}
            >
              {item.items!.map(renderItem)}
            </Listbox>
          </AccordionItem>
        </Accordion>
      ),
      [selected, iconClassName, renderItem]
    );

    return (
      <Listbox
        ref={ref}
        as="nav"
        hideSelectedIcon
        items={items}
        selectionMode="single"
        // likewise wrap selected in a Set
        selectedKeys={new Set([selected])}
        onSelectionChange={onSelChange}
        variant="flat"
        classNames={{ list: cn('flex flex-col space-y-2', classNames?.list) }}
      >
        {(item) =>
          item.type === SidebarItemType.Nest && item.items?.length
            ? renderNest(item)
            : renderItem(item)
        }
      </Listbox>
    );
  }
);

SidebarComponent.displayName = 'SidebarComponent';
export default SidebarComponent;
