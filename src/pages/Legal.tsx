import classNames from "classnames";
import React from "react";

import { Icon, Icons } from "@/components/Icon";
import { BiggerCenterContainer } from "@/components/layout/ThinContainer";
import {
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
} from "@/components/utils/Text";
import { PageTitle } from "@/pages/parts/util/PageTitle";
import { conf } from "@/setup/config";

import { SubPageLayout } from "./layouts/SubPageLayout";
import { Link } from "./onboarding/utils";

export function shouldHaveLegalPage() {
  return !!conf().DMCA_EMAIL;
}

function LegalCard(props: {
  icon: Icons;
  subtitle: string;
  title: string;
  description: React.ReactNode;
  colorClass: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-onboarding-card/40 duration-300 border border-onboarding-border rounded-lg p-7">
      <div>
        <Icon
          icon={props.icon}
          className={classNames("text-4xl mb-6 block", props.colorClass)}
        />
        <Heading3
          className={classNames(
            "!mt-0 !mb-0 !text-xs uppercase",
            props.colorClass,
          )}
        >
          {props.subtitle}
        </Heading3>
        <Heading2 className="!mb-0 !mt-1 !text-base">{props.title}</Heading2>
        <div className="!my-4 space-y-3 text-gray-300">{props.description}</div>
      </div>
      <div>{props.children}</div>
    </div>
  );
}

export function LegalPage() {
  return (
    <SubPageLayout>
      <PageTitle subpage k="global.pages.legal" />
      <BiggerCenterContainer classNames="!pt-0">
        <Heading1>DMCA + Legal Information</Heading1>
        <Paragraph className="text-gray-400 text-lg mb-8">
          Important information about our service, content policies, and user
          responsibilities.
        </Paragraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <LegalCard
            icon={Icons.SEARCH}
            subtitle="Service Model"
            title="How We Operate"
            colorClass="text-blue-400"
            description={
              <>
                <Paragraph>
                  film.kace.dev functions as a search engine and content
                  aggregator that indexes publicly available media from across
                  the internet.
                  <br />
                  <br />
                  We don&apos;t host, store, or control any media files -
                  everything is sourced from external third-party websites that
                  are already publicly accessible.
                  <br />
                  <br />
                  Our automated systems simply provide links to content
                  that&apos;s already available online, without bypassing any
                  security measures.
                </Paragraph>
                <Link to="/about">
                  Learn more about how film.kace.dev works
                </Link>
              </>
            }
          />

          <LegalCard
            icon={Icons.CIRCLE_CHECK}
            subtitle="Copyright Policy"
            title="Content & Copyright"
            colorClass="text-green-400"
            description={
              <Paragraph>
                Since we don&apos;t host any content ourselves, all takedown
                requests must go directly to the websites that actually host the
                files.
                <br />
                <br />
                We respect intellectual property rights and will cooperate with
                valid legal requests within our technical capabilities.
                <br />
                <br />
                For content removal, please contact the original hosting
                platform - we cannot remove what we don&apos;t control.
                <br />
                <br />
                If you are a copyright holder and want to report a violation, we
                are more than happy to point you to where we found the content.
              </Paragraph>
            }
          />

          <LegalCard
            icon={Icons.EYE_SLASH}
            subtitle="Data Protection"
            title="Privacy & Data"
            colorClass="text-purple-400"
            description={
              <Paragraph>
                User privacy is important to us. We don&apos;t collect, store,
                or track any personal information about our users.
                <br />
                <br />
                Optionally, users can store their bookmarks and watch history in
                our encrypted backend. But we don&apos;t store any personal
                information or identifying data.
                <br />
                <br />
                film.kace.dev is entirely self hostable, and can be run on any
                server. Even by yourself.
              </Paragraph>
            }
          />

          <LegalCard
            icon={Icons.USER}
            subtitle="User Responsibilities"
            title="User Guidelines"
            colorClass="text-yellow-400"
            description={
              <Paragraph>
                Users are responsible for ensuring their access complies with
                local laws and regulations in their jurisdiction.
                <br />
                <br />
                We strongly recommend using VPN services for enhanced privacy
                and security while browsing. Downloading is not advised.
                <br />
                <br />
                Please respect intellectual property rights and be mindful of
                copyright laws in your area.
              </Paragraph>
            }
          />

          <LegalCard
            icon={Icons.WARNING}
            subtitle="Terms & Conditions"
            title="Service Terms"
            colorClass="text-red-400"
            description={
              <Paragraph>
                film.kace.dev is licensed under the MIT license.
                <br />
                <br />
                By using our platform, you acknowledge these terms and agree
                that we&apos;re not responsible for third-party content.
                <br />
                <br />
                We operate in good faith compliance with applicable laws and
                regulations. We are not liable for any damages or losses
                incurred while using our service.
              </Paragraph>
            }
          />

          <LegalCard
            icon={Icons.MAIL}
            subtitle="Legal Contact"
            title="Legal Inquiries"
            colorClass="text-cyan-400"
            description={
              <Paragraph>
                For legal matters related to specific content, please contact
                the hosting websites directly as they have control over their
                files.
                <br />
                <br />
                film.kace.dev operates within legal boundaries and cooperates
                with legitimate requests when technically feasible.
              </Paragraph>
            }
          >
            {conf().DMCA_EMAIL && (
              <div className="flex space-x-3 items-center pt-4">
                <Icon icon={Icons.MAIL} className="text-white" />
                <span className="text-gray-300">Contact: </span>
                <a
                  href={`mailto:${conf().DMCA_EMAIL}`}
                  className="text-type-link hover:text-white transition-colors duration-300"
                >
                  {conf().DMCA_EMAIL}
                </a>
              </div>
            )}
          </LegalCard>
        </div>
      </BiggerCenterContainer>
    </SubPageLayout>
  );
}
