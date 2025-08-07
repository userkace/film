import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";

import { Icon, Icons } from "@/components/Icon";
import { UserIcon, UserIcons } from "@/components/UserIcon";

interface GroupDropdownProps {
  groups: string[];
  currentGroups: string[];
  onSelectGroups: (groups: string[]) => void;
  onCreateGroup: (group: string, icon: UserIcons) => void;
  onRemoveGroup: (groupToRemove?: string) => void;
}

const userIconList = Object.values(UserIcons);

function parseGroupString(group: string): { icon: UserIcons; name: string } {
  const match = group.match(/^\[([a-zA-Z0-9_]+)\](.*)$/);
  if (match) {
    const iconKey = match[1].toUpperCase() as keyof typeof UserIcons;
    const icon = UserIcons[iconKey] || userIconList[0];
    const name = match[2].trim();
    return { icon, name };
  }
  return { icon: userIconList[0], name: group };
}

export function GroupDropdown({
  groups,
  currentGroups,
  onSelectGroups,
  onCreateGroup,
  onRemoveGroup,
}: GroupDropdownProps) {
  const [open, setOpen] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<UserIcons>(userIconList[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setShowInput(false);
        setNewGroup("");
        setSelectedIcon(userIconList[0]);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleToggleGroup = (group: string) => {
    let newGroups;
    if (currentGroups.includes(group)) {
      newGroups = currentGroups.filter((g) => g !== group);
    } else {
      newGroups = [...currentGroups, group];
    }
    onSelectGroups(newGroups);
  };

  const handleCreate = (group: string, icon: UserIcons) => {
    const groupString = `[${icon}]${group}`;
    onCreateGroup(groupString, icon);
    setOpen(false);
    setShowInput(false);
    setNewGroup("");
    setSelectedIcon(userIconList[0]);
  };

  return (
    <div ref={dropdownRef} className="relative min-w-[200px]">
      <button
        type="button"
        className="w-full px-3 py-2 text-xs bg-background-main border border-background-secondary rounded-lg text-white flex justify-between items-center hover:bg-mediaCard-hoverBackground transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {currentGroups.length > 0 ? (
          <span className="flex flex-wrap gap-1 items-center">
            {currentGroups.map((group) => {
              const { icon, name } = parseGroupString(group);
              return (
                <span
                  key={group}
                  className="flex items-center gap-1 bg-type-link/20 px-2 py-1 rounded text-type-link text-xs"
                >
                  <UserIcon icon={icon} className="inline-block w-4 h-4" />
                  {name}
                </span>
              );
            })}
          </span>
        ) : (
          <span className="text-type-secondary">
            {t("home.bookmarks.groups.dropdown.placeholderButton")}
          </span>
        )}
        <span className="ml-2 text-type-secondary">
          <Icon
            icon={open ? Icons.CHEVRON_UP : Icons.CHEVRON_DOWN}
            className="text-base"
          />
        </span>
      </button>
      {open && (
        <div className="absolute min-w-full z-[150] mt-1 end-0 bg-background-main border border-background-secondary rounded-lg shadow-lg py-1 pb-3 text-sm">
          {groups.length === 0 && !showInput && (
            <div className="px-4 py-2 text-type-secondary">
              {t("home.bookmarks.groups.dropdown.empty")}
            </div>
          )}
          {groups.map((group) => {
            const { icon, name } = parseGroupString(group);
            return (
              <label
                key={group}
                className="flex items-center gap-2 mx-1 px-3 py-2 hover:bg-mediaCard-hoverBackground rounded-md cursor-pointer transition-colors text-type-link/80"
              >
                <input
                  type="checkbox"
                  checked={currentGroups.includes(group)}
                  onChange={() => handleToggleGroup(group)}
                  className="accent-type-link"
                />
                <span className="w-5 h-5 flex items-center justify-center ml-1">
                  <UserIcon
                    icon={icon}
                    className="inline-block w-full h-full"
                  />
                </span>
                {name}
              </label>
            );
          })}
          <div className="flex flex-col gap-2 px-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                className="flex-1 px-2 py-1 rounded bg-background-main text-white border border-background-secondary text-xs min-w-0 placeholder:text-type-secondary"
                placeholder="Group name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate(newGroup, selectedIcon);
                  if (e.key === "Escape") setShowInput(false);
                }}
                style={{ minWidth: 0 }}
              />
              <button
                type="button"
                className="text-type-link font-bold px-2 py-1 min-w-[2.5rem]"
                onClick={() => handleCreate(newGroup, selectedIcon)}
                disabled={!newGroup.trim()}
                style={{ flexShrink: 0 }}
              >
                {t("home.bookmarks.groups.dropdown.addButton")}
              </button>
            </div>
            {newGroup.trim().length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-2 w-full justify-center">
                {userIconList.map((icon) => (
                  <button
                    type="button"
                    key={icon}
                    className={`rounded p-1 border-2 ${
                      selectedIcon === icon
                        ? "border-type-link bg-mediaCard-hoverBackground"
                        : "border-transparent hover:border-background-secondary"
                    }`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <span className="w-5 h-5 flex items-center justify-center">
                      <UserIcon
                        icon={icon}
                        className={`w-full h-full ${selectedIcon === icon ? "text-type-link" : ""}`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {currentGroups.length > 0 && (
            <div className="border-t border-background-secondary pt-2 px-4">
              <div className="text-xs text-red-400 mb-1">
                {t("home.bookmarks.groups.dropdown.removeFromGroup")}
              </div>
              <div className="flex flex-wrap gap-2">
                {currentGroups.map((group) => {
                  const { icon, name } = parseGroupString(group);
                  return (
                    <button
                      key={group}
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-red-900/30 text-red-300 text-xs hover:bg-red-700/30 transition-colors"
                      onClick={() => onRemoveGroup(group)}
                    >
                      <UserIcon icon={icon} className="inline-block w-4 h-4" />
                      {name}
                      <span className="ml-1">&times;</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="ml-2 text-xs text-red-400 underline hover:text-red-300 transition-colors"
                  onClick={() => onRemoveGroup()}
                >
                  {t("home.bookmarks.groups.dropdown.removeAll")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
