import classNames from "classnames";
import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { SearchBarInput } from "@/components/form/SearchBar";
import { ThinContainer } from "@/components/layout/ThinContainer";
import { MwLink } from "@/components/text/Link";
import { Ol } from "@/components/utils/Ol";
import { Heading1, Heading2, Paragraph } from "@/components/utils/Text";
import { PageTitle } from "@/pages/parts/util/PageTitle";

import { SubPageLayout } from "./layouts/SubPageLayout";

function Question(props: { title: string; children: React.ReactNode }) {
  return (
    <>
      <p className="text-white mb-2 font-medium">{props.title}</p>
      <div className="text-type-text">{props.children}</div>
    </>
  );
}

export function Button(props: {
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className={classNames(
        "font-bold rounded h-10 w-40 scale-90 hover:scale-95 transition-all duration-200",
        props.className,
      )}
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
}

function SectionHeading(props: { title: string }) {
  return (
    <h3 className="text-white font-medium text-lg my-8 pt-4">{props.title}</h3>
  );
}

type SectionKey =
  | "general"
  | "search"
  | "playback"
  | "connections"
  | "language";

interface Sections {
  general: JSX.Element[];
  search: JSX.Element[];
  playback: JSX.Element[];
  connections: JSX.Element[];
  language: JSX.Element[];
}

export function AboutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const questionKeys = Object.keys(t("about", { returnObjects: true }))
    .filter((key) => key.startsWith("q"))
    .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10));

  const sections: Sections = {
    general: [],
    search: [],
    playback: [],
    connections: [],
    language: [],
  };

  questionKeys.forEach((key) => {
    const section = t(`about.${key}.section`) as SectionKey;
    if (section && sections[section]) {
      sections[section].push(
        <Question title={t(`about.${key}.title`)}>
          {t(`about.${key}.body`)}
        </Question>,
      );
    }
  });

  const allFaqItems = [
    ...sections.general,
    ...sections.search,
    ...sections.playback,
    ...sections.connections,
    ...sections.language,
  ];

  const filteredItems = allFaqItems.filter((item: JSX.Element) => {
    try {
      const title = item?.props?.title?.toLowerCase() || "";
      const body = item?.props?.children?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return title.includes(query) || body.includes(query);
    } catch (e) {
      return false;
    }
  });

  const showFilteredItems = searchQuery.length > 0;

  return (
    <SubPageLayout>
      <PageTitle subpage k="global.pages.about" />
      <ThinContainer>
        <Heading1>{t("about.title")}</Heading1>
        <Paragraph>{t("about.description")}</Paragraph>

        <div>
          <SearchBarInput
            ref={searchRef}
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            onUnFocus={() => {}}
            placeholder={t("about.searchPlaceholder")}
            hideTooltip
          />
        </div>
        <div className="pt-4">
          <Trans i18nKey="about.help">
            <MwLink url="/support" />
          </Trans>
        </div>

        <Heading2 className="mt-10">{t("about.faqTitle")}</Heading2>

        {showFilteredItems ? (
          <Ol items={filteredItems} />
        ) : (
          <>
            {/* General Section */}
            {sections.general.length > 0 && (
              <>
                <SectionHeading title={t("about.sections.general")} />
                <Ol items={sections.general} />
              </>
            )}

            {/* Search Section */}
            {sections.search.length > 0 && (
              <>
                <SectionHeading title={t("about.sections.search")} />
                <Ol items={sections.search} />
              </>
            )}

            {/* Playback Section */}
            {sections.playback.length > 0 && (
              <>
                <SectionHeading title={t("about.sections.playback")} />
                <Ol items={sections.playback} />
              </>
            )}

            {/* FED API Section */}
            {sections.connections.length > 0 && (
              <>
                <SectionHeading title={t("about.sections.connections")} />
                <Ol items={sections.connections} />
              </>
            )}

            {/* Language Section */}
            {sections.language.length > 0 && (
              <>
                <SectionHeading title={t("about.sections.language")} />
                <Ol items={sections.language} />
              </>
            )}
          </>
        )}

        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          className="pt-2 w-full"
        >
          <Button
            className="py-px mt-8 box-content bg-buttons-secondary hover:bg-buttons-secondaryHover bg-opacity-90 text-buttons-secondaryText justify-center items-center"
            onClick={() => navigate("/discover")}
          >
            Discover
          </Button>
          <Button
            className="py-px mt-8 box-content bg-buttons-secondary hover:bg-buttons-secondaryHover bg-opacity-90 text-buttons-secondaryText justify-center items-center"
            onClick={() => navigate("/support")}
          >
            Support
          </Button>
        </div>
      </ThinContainer>
    </SubPageLayout>
  );
}
