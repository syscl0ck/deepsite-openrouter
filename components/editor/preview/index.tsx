"use client";
import { useUpdateEffect } from "react-use";
import { useMemo, useState } from "react";
import classNames from "classnames";
import { toast } from "sonner";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackPreviewRef,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";

import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/magic-ui/grid-pattern";
import { htmlTagToText } from "@/lib/html-tag-to-text";
import { Page } from "@/types";

export const Preview = ({
  // html,
  isResizing,
  isAiWorking,
  ref,
  device,
  currentTab,
  iframeRef,
  pages,
  // setCurrentPage,
  isEditableModeEnabled,
}: // onClickElement,
{
  html: string;
  isResizing: boolean;
  isAiWorking: boolean;
  pages: Page[];
  setCurrentPage: React.Dispatch<React.SetStateAction<string>>;
  ref: React.RefObject<HTMLDivElement | null>;
  iframeRef?: React.RefObject<SandpackPreviewRef | null>;
  device: "desktop" | "mobile";
  currentTab: string;
  isEditableModeEnabled?: boolean;
  onClickElement?: (element: HTMLElement) => void;
}) => {
  const [hoveredElement] = useState<HTMLElement | null>(null);

  // add event listener to the iframe to track hovered elements
  // const handleMouseOver = (event: MouseEvent) => {
  //   if (iframeRef?.current) {
  //     const iframeDocument = iframeRef.current.querySelector("iframe");
  //     if (iframeDocument) {
  //       const targetElement = event.target as HTMLElement;
  //       const iframeEl = iframeDocument as HTMLIFrameElement;
  //       const iframeBody = iframeEl.contentDocument?.body;
  //       if (hoveredElement !== targetElement && targetElement !== iframeBody) {
  //         setHoveredElement(targetElement);
  //         targetElement.classList.add("hovered-element");
  //       } else {
  //         return setHoveredElement(null);
  //       }
  //     }
  //   }
  // };
  // const handleMouseOut = () => {
  //   setHoveredElement(null);
  // };
  // const handleClick = (event: MouseEvent) => {
  // if (iframeRef?.current) {
  //   const iframeDocument = iframeRef.current.querySelector("iframe");
  //   if (iframeDocument) {
  //     const targetElement = event.target as HTMLElement;
  //     const iframeEl = iframeDocument as HTMLIFrameElement;
  //     const iframeBody = iframeEl.contentDocument?.body;
  //     if (targetElement !== iframeBody) {
  //       onClickElement?.(targetElement);
  //     }
  //   }
  // }
  // };

  // useUpdateEffect(() => {
  //   const cleanupListeners = () => {
  //     if (iframeRef?.current) {
  //       const iframeDocument = iframeRef.current.querySelector("iframe");
  //       if (iframeDocument) {
  //         iframeDocument.removeEventListener("mouseover", handleMouseOver);
  //         iframeDocument.removeEventListener("mouseout", handleMouseOut);
  //         iframeDocument.removeEventListener("click", handleClick);
  //       }
  //     }
  //   };

  //   if (iframeRef?.current) {
  //     const iframeDocument = iframeRef.current.querySelector("iframe");
  //     if (iframeDocument) {
  //       cleanupListeners();

  //       if (isEditableModeEnabled) {
  //         iframeDocument.addEventListener("mouseover", handleMouseOver);
  //         iframeDocument.addEventListener("mouseout", handleMouseOut);
  //         iframeDocument.addEventListener("click", handleClick);
  //       }
  //     }
  //   }

  //   return cleanupListeners;
  // }, [iframeRef, isEditableModeEnabled]);

  const selectedElement = useMemo(() => {
    if (!isEditableModeEnabled) return null;
    if (!hoveredElement) return null;
    return hoveredElement;
  }, [hoveredElement, isEditableModeEnabled]);

  const formattedPages = useMemo(() => {
    return pages.reduce((acc, page) => {
      acc[page.path] = page.html;
      return acc;
    }, {} as Record<string, string>);
  }, [pages]);

  return (
    <div
      ref={ref}
      className={classNames(
        "w-full border-l border-gray-900 h-full relative z-0 flex items-center justify-center",
        {
          "lg:p-4": currentTab !== "preview",
          "max-lg:h-0": currentTab === "chat",
          "max-lg:h-full": currentTab === "preview",
        }
      )}
      onClick={(e) => {
        if (isAiWorking) {
          e.preventDefault();
          e.stopPropagation();
          toast.warning("Please wait for the AI to finish working.");
        }
      }}
    >
      <GridPattern
        x={-1}
        y={-1}
        strokeDasharray={"4 2"}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
        )}
      />
      {!isAiWorking && hoveredElement && selectedElement && (
        <div
          className="cursor-pointer absolute bg-sky-500/10 border-[2px] border-dashed border-sky-500 rounded-r-lg rounded-b-lg p-3 z-10 pointer-events-none"
          style={{
            top:
              selectedElement.getBoundingClientRect().top +
              (currentTab === "preview" ? 0 : 24),
            left:
              selectedElement.getBoundingClientRect().left +
              (currentTab === "preview" ? 0 : 24),
            width: selectedElement.getBoundingClientRect().width,
            height: selectedElement.getBoundingClientRect().height,
          }}
        >
          <span className="bg-sky-500 rounded-t-md text-sm text-neutral-100 px-2 py-0.5 -translate-y-7 absolute top-0 left-0">
            {htmlTagToText(selectedElement.tagName.toLowerCase())}
          </span>
        </div>
      )}
      <div
        id="preview-iframe"
        title="output"
        className={classNames(
          "w-full select-none transition-all duration-200 bg-black h-full overflow-hidden",
          {
            "pointer-events-none": isResizing || isAiWorking,
            "lg:max-w-md lg:mx-auto lg:!rounded-[42px] lg:border-[8px] lg:border-neutral-700 lg:shadow-2xl lg:h-[80dvh] lg:max-h-[996px]":
              device === "mobile",
            "lg:border-[8px] lg:border-neutral-700 lg:shadow-2xl lg:rounded-[24px]":
              currentTab !== "preview" && device === "desktop",
          }
        )}
      >
        <SandpackProvider
          template="static"
          options={{
            classes: {
              "sp-wrapper": "!w-full !h-full",
              "sp-layout": "!w-full !h-full",
              "sp-stack": "!w-full !h-full",
            },
          }}
          files={formattedPages}
        >
          <SandpackLayout>
            <SandpackPreviewClient ref={iframeRef!} />
          </SandpackLayout>
        </SandpackProvider>
      </div>
    </div>
  );
};

const SandpackPreviewClient = ({
  ref,
}: {
  ref: React.RefObject<SandpackPreviewRef | null>;
}) => {
  const { sandpack } = useSandpack();

  useUpdateEffect(() => {
    const client = ref.current?.getClient();
    const clientId = ref.current?.clientId;

    if (client && clientId) {
      // console.log({ client });
      // console.log(sandpack.clients[clientId]);
      const iframe = client.iframe;
      console.log(iframe.contentWindow?.document);
    }
    /**
     * NOTE: In order to make sure that the client will be available
     * use the whole `sandpack` object as a dependency.
     */
  }, [sandpack]);

  return <SandpackPreview ref={ref} />;
};
