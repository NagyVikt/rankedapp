import React, { useState, useCallback, forwardRef } from 'react';
import {
  Listbox,
  ListboxItem,
  ListboxSection,
  Accordion,
  AccordionItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@heroui/react';

import { items, SidebarItem, SidebarItemType } from './sidebar-items';

export type SidebarProps = {
  isCompact?: boolean;
  hideEndContent?: boolean;
  iconClassName?: string;
  classNames?: Record<string, string>;
};

const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  ({ isCompact = false, hideEndContent = false, iconClassName, classNames }, ref) => {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // Determine default selected key from URL
    const defaultKey =
      items.find((it) => it.href && pathname.startsWith(it.href))?.key || items[0].key;
    const [selected, setSelected] = useState<React.Key>(defaultKey);

    // On selection change, update state and navigate
    const onSelChange = useCallback(
      (keys: React.Key[]) => {
        const key = Array.from(keys)[0];
        setSelected(key);
        const item = items.find((i) => i.key === key);
        if (item && item.href) {
          navigate(item.href);
        }
      },
      [navigate]
    );

    // Render a leaf menu item
    const renderItem = useCallback(
      (item: SidebarItem) => (
        <ListboxItem
          key={item.key}
          {...item}
          endContent={isCompact || hideEndContent ? null : item.endContent}
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
          {isCompact ? (
            <div className="flex w-full items-center justify-center">
              {item.icon && (
                <Icon icon={item.icon} width={24} className={iconClassName} />
              )}
            </div>
          ) : null}
        </ListboxItem>
      ),
      [isCompact, hideEndContent, iconClassName]
    );

    // Render a nested "nest" item with accordion
    const renderNest = useCallback(
      (item: SidebarItem) => (
        <Accordion key={item.key} className="p-0">
          <AccordionItem
            aria-label={item.title}
            title={
              <div className="flex items-center gap-2 p-2">
                {item.icon && (
                  <Icon icon={item.icon} width={24} className={iconClassName} />
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
              selectedKeys={[selected] as unknown as React.Key[]}
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
        hideSelectedIcon
        as="nav"
        classNames={{ list: cn('flex flex-col space-y-2', classNames?.list) }}
        items={items}
        selectionMode="single"
        selectedKeys={[selected] as unknown as React.Key[]}
        onSelectionChange={onSelChange}
        variant="flat"
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
Sidebar.displayName = 'Sidebar';

export default Sidebar;
