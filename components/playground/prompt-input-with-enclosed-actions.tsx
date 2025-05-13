'use client';

import type { TextAreaProps } from '@heroui/react';
import React from 'react';
import { Button, Tooltip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { cn } from '@heroui/react';

import PromptInput from './prompt-input';

export default function PromptInputWithEnclosedActions(
  props: TextAreaProps & {
    classNames?: Record<
      'button' | 'buttonIcon' | 'input' | 'innerWrapper',
      string
    >;
  },
) {
  return (
    <div className="flex w-full items-start gap-2">
      <PromptInput
        {...props}
        // Use the parent's controlled `value` and event handlers:
        value={props.value}
        onValueChange={(val) => {
          props.onChange?.({
            target: { value: val },
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }}
        classNames={{
          innerWrapper: cn('items-center', props.classNames?.innerWrapper),
          input: cn(
            'text-medium data-[has-start-content=true]:ps-0 data-[has-start-content=true]:pe-0',
            props.classNames?.input,
          ),
        }}
        startContent={
          <Tooltip showArrow content="Add file">
            <Button
              isIconOnly
              className="p-[10px]"
              radius="full"
              variant="light"
            >
              <Icon
                className="text-default-500"
                icon="solar:paperclip-linear"
                width={20}
              />
            </Button>
          </Tooltip>
        }
        endContent={
          <div className="flex gap-2">
            {/* Optional microphone icon if there's no text */}
            {!props.value && (
              <Tooltip showArrow content="Speak">
                <Button isIconOnly radius="full" variant="light">
                  <Icon
                    className="text-default-500"
                    icon="solar:microphone-3-linear"
                    width={20}
                  />
                </Button>
              </Tooltip>
            )}

            {/* Use the arrow icon as our form submit button */}
            <Tooltip showArrow content="Send message">
              <Button
                type="submit"
                isIconOnly
                className={props.classNames?.button || ''}
                color={!props.value ? 'default' : 'primary'}
                radius="full"
                variant={!props.value ? 'flat' : 'solid'}
              >
                <Icon
                  className={cn(
                    '[&>path]:stroke-[2px]',
                    !props.value
                      ? 'text-default-500'
                      : 'text-primary-foreground',
                    props.classNames?.buttonIcon || '',
                  )}
                  icon="solar:arrow-up-linear"
                  width={20}
                />
              </Button>
            </Tooltip>
          </div>
        }
      />
    </div>
  );
}
