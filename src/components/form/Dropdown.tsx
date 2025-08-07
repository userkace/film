import { Listbox } from "@headlessui/react";
import React, { Fragment } from "react";

import { Icon, Icons } from "@/components/Icon";
import { Transition } from "@/components/utils/Transition";

export interface OptionItem {
  id: string;
  name: string;
  leftIcon?: React.ReactNode;
}

interface DropdownProps {
  selectedItem: OptionItem;
  setSelectedItem: (value: OptionItem) => void;
  options: Array<OptionItem>;
  direction?: "up" | "down";
  side?: "left" | "right";
  customButton?: React.ReactNode;
  customMenu?: React.ReactNode;
  className?: string;
  preventWrap?: boolean;
}

export function Dropdown(props: DropdownProps) {
  const { direction = "down", customButton, customMenu } = props;

  return (
    <div className={`relative my-4 w-fit max-w-[25rem] ${props.className}`}>
      <Listbox value={props.selectedItem} onChange={props.setSelectedItem}>
        {({ open }) => (
          <>
            {customButton ? (
              <Listbox.Button as={Fragment}>{customButton}</Listbox.Button>
            ) : (
              <Listbox.Button className="relative z-[101] w-full rounded-lg bg-dropdown-background hover:bg-dropdown-hoverBackground py-3 pl-3 pr-10 text-left text-white shadow-md focus:outline-none tabbable cursor-pointer">
                <span className="flex gap-4 items-center truncate">
                  {props.selectedItem.leftIcon
                    ? props.selectedItem.leftIcon
                    : null}
                  {props.selectedItem.name}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <Icon
                    icon={Icons.UP_DOWN_ARROW}
                    className={`transform transition-transform text-xl text-dropdown-secondary ${direction === "up" ? "rotate-180" : ""}`}
                  />
                </span>
              </Listbox.Button>
            )}
            <Transition
              animation="slide-down"
              show={open}
              className={`absolute z-[102] min-w-[20px] w-fit max-h-60 overflow-auto rounded-lg bg-dropdown-background py-1 text-white shadow-lg ring-1 ring-black ring-opacity-5 scrollbar-thin scrollbar-track-background-secondary scrollbar-thumb-type-secondary focus:outline-none ${
                direction === "up" ? "bottom-full mb-4" : "top-full mt-1"
              } ${props.side === "right" ? "right-0" : "left-0"}`}
            >
              {customMenu ? (
                <Listbox.Options static as={Fragment}>
                  {customMenu}
                </Listbox.Options>
              ) : (
                <Listbox.Options static className="py-1">
                  {props.options.map((opt) => (
                    <Listbox.Option
                      className={({ active }) =>
                        `cursor-pointer flex gap-4 items-center relative select-none py-2 px-4 mx-1 rounded-lg ${
                          active
                            ? "bg-background-secondaryHover text-type-link"
                            : "text-type-secondary"
                        } ${props.preventWrap ? "whitespace-nowrap" : ""}`
                      }
                      key={opt.id}
                      value={opt}
                    >
                      {opt.leftIcon ? opt.leftIcon : null}
                      {opt.name}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              )}
            </Transition>
          </>
        )}
      </Listbox>
    </div>
  );
}
