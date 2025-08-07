import { useTranslation } from "react-i18next";

import { Button } from "@/components/buttons/Button";
import { Item, SortableList } from "@/components/form/SortableList";
import { Modal, ModalCard } from "@/components/overlays/Modal";
import { Heading2, Paragraph } from "@/components/utils/Text";

interface EditGroupOrderModalProps {
  id: string;
  isShown: boolean;
  items: Item[];
  onCancel: () => void;
  onSave: () => void;
  onItemsChange: (newItems: Item[]) => void;
}

export function EditGroupOrderModal({
  id,
  isShown,
  items,
  onCancel,
  onSave,
  onItemsChange,
}: EditGroupOrderModalProps) {
  const { t } = useTranslation();

  if (!isShown) return null;

  return (
    <Modal id={id}>
      <ModalCard>
        <Heading2 className="!my-0">
          {t("home.bookmarks.groups.reorder.title")}
        </Heading2>
        <Paragraph className="mt-4">
          {t("home.bookmarks.groups.reorder.description")}
        </Paragraph>
        <div>
          <SortableList items={items} setItems={onItemsChange} />
        </div>
        <div className="flex gap-4 mt-6 justify-end">
          <Button theme="secondary" onClick={onCancel}>
            {t("home.bookmarks.groups.reorder.cancel")}
          </Button>
          <Button theme="purple" onClick={onSave}>
            {t("home.bookmarks.groups.reorder.save")}
          </Button>
        </div>
      </ModalCard>
    </Modal>
  );
}
