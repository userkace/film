import { Dropdown } from "@/components/form/Dropdown";
import { Region, useRegionStore } from "@/utils/detectRegion";

export function RegionSelectorPart() {
  const { region, setRegion } = useRegionStore();

  const regionOptions = [
    { id: "dallas", name: "Dallas, TX" },
    { id: "portland", name: "Portland, OR" },
    { id: "new-york", name: "New York, NY" },
    { id: "paris", name: "Paris, France" },
    { id: "hong-kong", name: "Hong Kong" },
    { id: "kansas", name: "Kansas City, MO" },
    { id: "sydney", name: "Sydney, Australia" },
    { id: "singapore", name: "Singapore" },
    { id: "mumbai", name: "Mumbai, India" },
  ];

  return (
    <Dropdown
      options={regionOptions}
      selectedItem={{
        id: region || "new-york",
        name:
          regionOptions.find((r) => r.id === region)?.name ||
          "Unknown (New York, NY)",
      }}
      setSelectedItem={(item) => setRegion(item.id as Region, true)}
      direction="up"
    />
  );
}
