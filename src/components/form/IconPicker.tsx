import classNames from "classnames";

import { UserIcon, UserIcons } from "../UserIcon";

const icons = [
  UserIcons.CAT,
  UserIcons.WEED,
  UserIcons.USER_GROUP,
  UserIcons.COUCH,
  UserIcons.MOBILE,
  UserIcons.TICKET,
  UserIcons.SATURN,
  UserIcons.HEADPHONES,
  UserIcons.TV,
  UserIcons.GHOST,
  UserIcons.COFFEE,
  UserIcons.FIRE,
  UserIcons.MEGAPHONE,
  UserIcons.DRAGON,
  UserIcons.RISING_STAR,
  UserIcons.CLOUD_ARROW_UP,
  UserIcons.WAND,
  UserIcons.CLAPPER_BOARD,
];
export const initialIcon = icons[0];

export function IconPicker(props: {
  label: string;
  value: UserIcons;
  onInput: (v: UserIcons) => void;
}) {
  return (
    <div className="space-y-3">
      {props.label ? (
        <p className="font-bold text-white">{props.label}</p>
      ) : null}

      <div className="grid grid-cols-6 gap-3">
        {icons.map((icon) => {
          return (
            <button
              type="button"
              tabIndex={0}
              className={classNames(
                "w-full h-10 rounded flex justify-center items-center text-white pointer border-2 border-opacity-10 cursor-pointer",
                props.value === icon
                  ? "bg-buttons-purple border-white"
                  : "bg-authentication-inputBg border-transparent",
              )}
              onClick={() => props.onInput(icon)}
              key={icon}
            >
              <UserIcon className="text-xl" icon={icon} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
