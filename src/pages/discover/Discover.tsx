import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

import { DetailsModal } from "@/components/overlays/detailsModal";
import { useModal } from "@/components/overlays/Modal";

import { SubPageLayout } from "../layouts/SubPageLayout";
import { FeaturedCarousel } from "./components/FeaturedCarousel";
import type { FeaturedMedia } from "./components/FeaturedCarousel";
import DiscoverContent from "./discoverContent";
import { PageTitle } from "../parts/util/PageTitle";

export function Discover() {
  const [detailsData, setDetailsData] = useState<any>();
  const detailsModal = useModal("discover-details");

  // Clear details data when modal is closed
  useEffect(() => {
    if (!detailsModal.isShown) {
      setDetailsData(undefined);
    }
  }, [detailsModal.isShown]);

  const handleShowDetails = (media: FeaturedMedia) => {
    setDetailsData({
      id: Number(media.id),
      type: media.type,
    });
    detailsModal.show();
  };

  return (
    <SubPageLayout>
      <Helmet>
        {/* Hide scrollbar */}
        <style type="text/css">{`
            html, body {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
      </Helmet>

      <PageTitle subpage k="global.pages.discover" />

      <div className="!mt-[-170px]">
        {/* Featured Carousel */}
        <FeaturedCarousel onShowDetails={handleShowDetails} />
      </div>

      {/* Main Content */}
      <div className="relative z-20 px-4 md:px-10">
        <DiscoverContent />
      </div>

      {detailsData && <DetailsModal id="discover-details" data={detailsData} />}
    </SubPageLayout>
  );
}
