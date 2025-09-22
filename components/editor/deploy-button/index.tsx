/* eslint-disable @typescript-eslint/no-explicit-any */
import { MdSave } from "react-icons/md";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/hooks/useUser";
import { Page } from "@/types";
import { DeployButtonContent } from "./content";

export function DeployButton({
  pages,
  prompts,
}: {
  pages: Page[];
  prompts: string[];
}) {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-end gap-5">
      <div className="relative flex items-center justify-end">
        {user?.id ? (
          <Popover>
            <PopoverTrigger asChild>
              <div>
                <Button variant="default" className="max-lg:hidden !px-4">
                  <MdSave className="size-4" />
                  Publish your Project
                </Button>
                <Button variant="default" size="sm" className="lg:hidden">
                  Publish
                </Button>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="!rounded-2xl !p-0 !bg-white !border-neutral-200 min-w-xs text-center overflow-hidden"
              align="end"
            >
              <DeployButtonContent pages={pages} prompts={prompts} />
            </PopoverContent>
          </Popover>
        ) : (
          <>
            <Button
              variant="default"
              className="max-lg:hidden !px-4"
              onClick={() => {/* Handle publish action */}}
            >
              <MdSave className="size-4" />
              Publish your Project
            </Button>
            <Button
              variant="default"
              size="sm"
              className="lg:hidden"
              onClick={() => {/* Handle publish action */}}
            >
              Publish
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
