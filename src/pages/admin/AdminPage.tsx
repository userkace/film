import { ThinContainer } from "@/components/layout/ThinContainer";
import { Heading1, Paragraph } from "@/components/utils/Text";
import { SubPageLayout } from "@/pages/layouts/SubPageLayout";
import { ConfigValuesPart } from "@/pages/parts/admin/ConfigValuesPart";
import { M3U8TestPart } from "@/pages/parts/admin/M3U8TestPart";
import { TMDBTestPart } from "@/pages/parts/admin/TMDBTestPart";
import { WorkerTestPart } from "@/pages/parts/admin/WorkerTestPart";

import { BackendTestPart } from "../parts/admin/BackendTestPart";
import { EmbedOrderPart } from "../parts/admin/EmbedOrderPart";

export function AdminPage() {
  return (
    <SubPageLayout>
      <ThinContainer>
        <Heading1>Admin tools</Heading1>
        <Paragraph>
          Silly tools used test film.kace.dev! ૮₍´˶• . • ⑅ ₎ა
        </Paragraph>

        <ConfigValuesPart />
        <BackendTestPart />
        <WorkerTestPart />
        <TMDBTestPart />
        <M3U8TestPart />
        <EmbedOrderPart />
      </ThinContainer>
    </SubPageLayout>
  );
}
