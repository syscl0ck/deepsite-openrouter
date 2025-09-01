import { Page } from "@/types";
// import { PlusIcon } from "lucide-react";
import { ListPagesItem } from "./page";

export function ListPages({
  pages,
  currentPage,
  onSelectPage,
  // onNewPage,
  onDeletePage,
}: {
  pages: Array<Page>;
  currentPage: string;
  onSelectPage: (path: string, newPath?: string) => void;
  onNewPage: () => void;
  onDeletePage: (path: string) => void;
}) {
  return (
    <div className="w-full flex items-center justify-start bg-neutral-950 overflow-auto flex-nowrap min-h-[44px]">
      {pages.map((page, i) => (
        <ListPagesItem
          key={i}
          page={page}
          currentPage={currentPage}
          onSelectPage={onSelectPage}
          onDeletePage={onDeletePage}
          index={i}
        />
      ))}
      {/* <button
        className="max-h-14 min-h-14 pl-2 pr-4 py-4 text-neutral-400 cursor-pointer text-sm hover:bg-neutral-900 flex items-center justify-center gap-1 text-nowrap"
        onClick={onNewPage}
      >
        <PlusIcon className="h-3" />
        New Page
      </button> */}
    </div>
  );
}
