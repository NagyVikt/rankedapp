// components/sidebar/SidebarComponent.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, Button, Card, CardBody, CardFooter, ScrollShadow, Spacer } from '@heroui/react';
import { Icon } from '@iconify/react';
import { items } from './sidebar-items';
import { AcmeIcon } from './acme';
import { useShops } from '@/context/shops';

export default function SidebarComponent() {
  const pathname = usePathname();
  const { shops, addShop } = useShops();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAdd = () => {
    const trimmedName = newName.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedName || !trimmedUrl) return;
    addShop({ name: trimmedName, url: trimmedUrl });
    setNewName('');
    setNewUrl('');
    setShowModal(false);
  };

  return (
    <>
      <div className="h-full min-h-[48rem]">
        <div className="relative flex h-full w-72 flex-col border-r border-divider p-6">
          {/* Brand */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
              <AcmeIcon className="text-background" />
            </div>
            <span className="text-small font-bold uppercase">RANKED</span>
          </div>
          <Spacer y={12} />

          {/* User */}
          <div className="flex items-center gap-3 px-4">
            <Avatar
              isBordered
              size="sm"
              src="https://i.pravatar.cc/150?u=a04258114e29026708c"
            />
            <div className="flex flex-col">
              <p className="text-small font-medium text-default-600">John Doe</p>
              <p className="text-tiny text-default-400">Product Designer</p>
            </div>
          </div>

          {/* Navigation */}
          <ScrollShadow className="-mr-6 flex-1 max-h-full py-6 pr-6">
            <nav className="flex flex-col space-y-2 px-2">
            {items.map((item) => {
              const isActive = pathname === item.href;
              const isWebshops = item.key === "webshops";

              return (
                <div key={item.key} className="flex items-center">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded transition-colors ${
                        isActive
                          ? "bg-default-100 text-foreground"
                          : "text-default-700 hover:bg-default-100"
                      }`}
                    >
                      {item.icon && <Icon icon={item.icon} width={24} />}
                      <span className="text-small font-medium">{item.title}</span>
                      {item.endContent && <span className="ml-auto">{item.endContent}</span>}
                    </Link>
                  ) : (
                    // fallback if you want non-link items
                    <span className="flex items-center gap-3 px-4 py-2 rounded text-default-700">
                      {item.icon && <Icon icon={item.icon} width={24} />}
                      <span className="text-small font-medium">{item.title}</span>
                      {item.endContent && <span className="ml-auto">{item.endContent}</span>}
                    </span>
                  )}

                  {isWebshops && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="ml-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 hover:bg-default-100"
                      aria-label="Add Webshop"
                    >
                      <Icon icon="mdi:plus" width={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
              );
            })}

            </nav>

            {/* Upgrade Card */}
            <Card className="mx-2 overflow-visible" shadow="sm">
              <CardBody className="items-center py-5 text-center">
                <h3 className="text-medium font-medium text-default-700">
                  Download Our plugin 🚀
                </h3>
                <p className="p-4 text-small text-default-500">
                  Download our plugin to get the most out of your Webshop.
                </p>
              </CardBody>
              <CardFooter className="absolute -bottom-8 justify-center">
                <Button
                  className="px-10 shadow-md"
                  color="primary"
                  radius="full"
                  variant="shadow"
                >
                  Download
                </Button>
              </CardFooter>
            </Card>
          </ScrollShadow>

          {/* Actions */}
          <div className="mt-auto flex flex-col space-y-2">
            <Button
              fullWidth
              className="justify-start text-default-500 hover:text-foreground"
              startContent={<Icon icon="solar:info-circle-line-duotone" width={24} className="text-default-500" />}
              variant="light"
            >
              Help & Information
            </Button>
            <Button
              fullWidth
              className="justify-start text-default-500 hover:text-foreground"
              startContent={<Icon icon="solar:minus-circle-line-duotone" width={24} className="rotate-180 text-default-500" />}
              variant="light"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-72">
            <h3 className="text-medium font-medium mb-4">Add New Webshop</h3>
            <label className="block mb-2">
              <span className="text-sm text-gray-700">Shop Name</span>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </label>
            <label className="block mb-4">
              <span className="text-sm text-gray-700">Shop URL</span>
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <Button variant="light" onPress={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onPress={handleAdd} disabled={!newName.trim() || !newUrl.trim()}>
                Add Shop
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}