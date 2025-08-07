import { useTranslation } from "react-i18next";

interface DiscoverNavigationProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function DiscoverNavigation({
  selectedCategory,
  onCategoryChange,
}: DiscoverNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="pb-4 w-full max-w-screen-xl mx-auto">
      <div className="relative flex justify-center">
        <div className="flex space-x-4">
          {["movies", "tvshows", "editorpicks"].map((category) => (
            <button
              key={category}
              type="button"
              className={`text-xl md:text-2xl font-bold p-2 bg-transparent text-center rounded-full cursor-pointer flex items-center transition-transform duration-200 ${
                selectedCategory === category
                  ? "transform scale-105 text-type-link"
                  : "text-type-secondary"
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {t(`discover.tabs.${category}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
