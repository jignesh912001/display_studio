import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {  reaction } from "mobx";

import {
  Navbar,
  Alignment,
  Popover,
  Button,
  PopoverInteractionKind,
  Position,
  InputGroup,
  RadioGroup,
  Radio,
  FormGroup,
  Checkbox,
  Menu,
  MenuItem,
} from "@blueprintjs/core";
import styled from "polotno/utils/styled";
import { saveAssetsAction } from "../API/APICallingAll";
import PreviewDialog from "../Page/DialogPreview";

import { createStore } from "polotno/model/store";

const NavbarContainer = styled("div")`
  white-space: nowrap;
  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled("div")`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;

export default observer(({ store }) => {
  const generateFileName = () => {
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const currentDate = new Date().toISOString().split("T")[0];
    return `disploy-${randomNumber}-${currentDate}`;
  };

  const [isPreviewOpen, setPreviwOpen] = useState(false);
  const [fileName, setFileName] = useState(generateFileName());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const [selectedPages, setSelectedPages] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [pageThumbnails, setPageThumbnails] = useState([]);
  const [downloadFormat, setDownloadFormat] = useState("png");

  const loadingRef = useRef(false);
  const thumbnailStoreRef = useRef(createStore());

  const dataURLToBlob = (dataURL) => {
    const parts = dataURL.split(",");
    const mime = parts[0].match(/:(.*?);/)[1];
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  };

  const getPagesToExport = async () => {
    const json = await store.toJSON();
    const allPages = json.pages;

    if (isAllSelected || selectedPages.length === 0) {
      return allPages;
    }

    const selected = selectedPages
      .map((pageNumber) => allPages[pageNumber - 1])
      .filter(Boolean);

    return selected;
  };

  const convertPngDataUrlToJpgBlob = (pngDataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.95 // quality 95%
        );
      };
      img.src = pngDataUrl;
    });
  };

  const saveAssetsImage = async (format = "png") => {
    setSaving(true);
    try {
      const selectedPages = await getPagesToExport();
      if (!selectedPages) {
        setSaving(false);
        return;
      }

      const originalJSON = await store.toJSON();

      for (let i = 0; i < selectedPages.length; i++) {
        const page = selectedPages[i];
        await store.loadJSON({ pages: [page] });
        await new Promise((r) => setTimeout(r, 200));

        // Here generate image with pixelRatio 2 and mime type accordingly
        const image = await store.toDataURL({ pixelRatio: 2 });

        // If jpg is selected, convert png dataURL to jpg dataURL before converting blob (optional)
        // For simplicity, you can keep png for now or add canvas conversion

        let blob;
        if (format === "jpg") {
          blob = await convertPngDataUrlToJpgBlob(image);
        } else {
          blob = dataURLToBlob(image);
        }

        const formData = new FormData();
        formData.append("File", blob, `image.${format}`);
        formData.append("Operation", "Insert");
        formData.append("AssetType", "Image");
        formData.append("IsActive", true);
        formData.append("IsDelete", false);
        formData.append("FolderID", 0);
        await saveAssetsAction(formData);

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}-page-${i + 1}.${format}`;
        link.click();
      }

      await store.loadJSON(originalJSON);

      setTimeout(() => {
        sessionStorage.setItem("disploy_studio_token", "");
        window.close();
      }, 300);

      setSaving(false);
    } catch (error) {
      console.error("Error exporting image:", error);
    }
  };

  const downloadVideo = async () => {
    setProgress(0);
    setLoading(true);
    try {
      const selectedPages = await getPagesToExport();
      if (!selectedPages) {
        setLoading(false);
        return;
      }

      const videoDesign = { ...store.toJSON(), pages: selectedPages };

      const response = await fetch(
        "https://api.polotno.com/api/renders?KEY=nFA5H9elEytDyPyvKL7T",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            design: videoDesign,
            pixelRatio: "1",
            dpi: "72",
            fps: "10",
            format: "mp4",
            outputFormat: "url",
          }),
        }
      );

      if (!response.ok) throw new Error("Video render request failed");

      const renderData = await response.json();
      const renderId = renderData.id;

      for (let i = 0; i < 100; i++) {
        const req = await fetch(
          `https://api.polotno.com/api/renders/${renderId}?KEY=nFA5H9elEytDyPyvKL7T`
        );
        const job = await req.json();

        if (job.status === "error") break;
        if (job.status === "progress") setProgress(job.progress);
        if (job.status === "done") {
          const url = job.output;
          await downloadFile(url, `${fileName}.mp4`);
          break;
        }

        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong...");
    }
  };

  const downloadFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append("File", blob, "video.mp4");
    formData.append("Operation", "Insert");
    formData.append("AssetType", "Video");
    formData.append("IsActive", true);
    formData.append("IsDelete", false);
    formData.append("FolderID", 0);
    await saveAssetsAction(formData);

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    setProgress(0);
    setLoading(false);

    setTimeout(() => {
      sessionStorage.setItem("disploy_studio_token", "");
      window.close();
    }, 300);
  };

  const preparePreview = async () => {
    try {
      const previews = [];
      const originalJSON = await store.toJSON();
      const allPages = originalJSON.pages;
      for (let i = 0; i < allPages.length; i++) {
        const singlePage = allPages[i];
        await store.loadJSON({ pages: [singlePage] });
        await new Promise((resolve) => setTimeout(resolve, 200));
        const img = await store.toDataURL();
        previews.push(img);
      }
      await store.loadJSON(originalJSON);
      setPreview(previews);
      setPreviwOpen(true);
    } catch (error) {
      console.error(":x: Error in prepareAllPreviews:", error);
    }
  };

  useEffect(() => {
    const dispose = reaction(
      () =>
        store.pages.map((page) => ({
          id: page.id,
          width: page.width,
          height: page.height,
          elements: page.children
            ? page.children.map((el) => ({
                id: el.id,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                fill: el.fill,
                stroke: el.stroke,
                rotation: el.rotation,
                // add any other property that should trigger update
              }))
            : [],
        })),
      async () => {
        if (loadingRef.current) {
          return;
        }
        loadingRef.current = true;

        try {
          const originalJSON = await store.toJSON();
          const previews = [];

          for (let i = 0; i < originalJSON.pages.length; i++) {
            const page = originalJSON.pages[i];
            await store.loadJSON({ pages: [page] });
            await new Promise((res) => setTimeout(res, 150));
            const image = await store.toDataURL({ width: 120, height: 80 });
            previews.push(image);
          }

          await store.loadJSON(originalJSON);
          setPageThumbnails(previews);
        } catch (err) {
          console.error("Error generating thumbnails:", err);
        } finally {
          loadingRef.current = false;
        }
      },
      { fireImmediately: true }
    );
    return () => dispose();
  }, [store]);

  const totalPages = store.pages.length;
  const pageRangeLabel = totalPages > 0 ? `All (${1}-${totalPages})` : "All";

  const toggleCurrentPageSelection = (e) => {
    if (e) e.stopPropagation();
    const currentPageIndex = store.activePage
      ? store.pages.findIndex((p) => p.id === store.activePage.id)
      : 0;
    const currentPageNum = currentPageIndex + 1;

    if (selectedPages.length === 1 && selectedPages[0] === currentPageNum) {
      setSelectedPages([]);
    } else {
      setSelectedPages([currentPageNum]);
    }
    setIsAllSelected(false);
  };

  const getSelectedPagesLabel = () => {
    if (isAllSelected) {
      return `All (${store.pages.length})`;
    }
    if (selectedPages.length === 1) {
      return `Page ${selectedPages[0]}`;
    }
    if (selectedPages.length > 1) {
      return selectedPages
        .sort((a, b) => a - b)
        .map((page) => `Page ${page}`)
        .join(", ");
    }
    return "Select Pages";
  };

  function triggerDownload(pagesToDownload) {
    if (downloadFormat === "mp4") {
      downloadVideo(pagesToDownload);
    } else if (downloadFormat === "png" || downloadFormat === "jpg") {
      saveAssetsImage(downloadFormat, pagesToDownload);
    }
  }
  return (
    <NavbarContainer className="bp5-navbar">
      <style>
        {`
        .bp5-form-group .bp5-label {
          margin: 0 !important;
        }
      `}
      </style>
      <NavInner>
        <Navbar.Group align={Alignment.LEFT}>
          <FormGroup
            label="Enter file name"
            labelFor="file-name-input"
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              margin: "0px",
              gap: "10px",
            }}
          >
            <InputGroup
              id="file-name-input"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              style={{
                borderRadius: "8px",
                padding: "8px",
                color: "#FFF",
                fontWeight: "bold",
              }}
            />
          </FormGroup>
        </Navbar.Group>

        <Navbar.Group align={Alignment.RIGHT}>
          <Button style={{ marginRight: "10px" }} onClick={preparePreview}>
            Preview
          </Button>

          <Popover
            interactionKind={PopoverInteractionKind.CLICK}
            position={Position.BOTTOM_LEFT}
            content={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "300px",
                  padding: 10,
                  paddingBottom: "20px",
                }}
              >
                {/* <DownloadMenu /> */}
                <FormGroup
                  label="Select format"
                  style={{ marginBottom: "0px" }}
                >
                  <RadioGroup
                    inline
                    selectedValue={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.currentTarget.value)}
                  >
                    <Radio label="MP4 (Video)" value="mp4" />
                    <Radio label="PNG (Image)" value="png" />
                    <Radio label="JPG (Image)" value="jpg" />
                  </RadioGroup>
                </FormGroup>
                <Popover
                  position="bottom"
                  content={
                    <Menu
                      style={{
                        width: "300px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      <MenuItem
                        text={
                          <div style={{ padding: "5px" }}>
                            <Checkbox
                              label={pageRangeLabel}
                              style={{ marginBottom: "0px" }}
                              checked={isAllSelected}
                              onChange={() => {
                                if (isAllSelected) {
                                  setIsAllSelected(false);
                                  setSelectedPages([]);
                                } else {
                                  const pageNumbers = store.pages.map(
                                    (_, idx) => idx + 1
                                  );
                                  setIsAllSelected(true);
                                  setSelectedPages(pageNumbers);
                                }
                              }}
                            />
                          </div>
                        }
                        shouldDismissPopover={false}
                      />
                      <MenuItem
                        onClick={toggleCurrentPageSelection}
                        text={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "5px",
                              cursor: "pointer",
                            }}
                          >
                            <Checkbox
                              style={{ marginBottom: "0px" }}
                              checked={
                                selectedPages.length === 1 &&
                                store.activePage &&
                                selectedPages[0] ===
                                  store.pages.findIndex(
                                    (p) => p.id === store.activePage.id
                                  ) +
                                    1
                              }
                              onClick={(e) => e.stopPropagation()}
                              label={`Current Page (${
                                store.activePage
                                  ? store.pages.findIndex(
                                      (p) => p.id === store.activePage.id
                                    ) + 1
                                  : 1
                              })`}
                            />
                          </div>
                        }
                        shouldDismissPopover={false}
                      />
                      {store.pages.map((_, index) => {
                        const _Width =
                          _.width === "auto" ? store.width : _.width;
                        const _Height =
                          _.height === "auto" ? store.height : _.height;

                        const pageNumber = index + 1;
                        const isChecked = selectedPages.includes(pageNumber);
                        return (
                          <MenuItem
                            key={pageNumber}
                            text={
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "5px",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  let updated = [...selectedPages];
                                  if (isChecked) {
                                    updated = updated.filter(
                                      (p) => p !== pageNumber
                                    );
                                  } else {
                                    updated.push(pageNumber);
                                  }
                                  setSelectedPages(updated);
                                  setIsAllSelected(
                                    updated.length === store.pages.length
                                  );
                                }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation(); // Prevent double toggle from outer click
                                    let updated = [...selectedPages];
                                    if (isChecked) {
                                      updated = updated.filter(
                                        (p) => p !== pageNumber
                                      );
                                    } else {
                                      updated.push(pageNumber);
                                    }
                                    setSelectedPages(updated);
                                    setIsAllSelected(
                                      updated.length === store.pages.length
                                    );
                                  }}
                                  style={{ margin: 0 }}
                                />
                                <img
                                  src={pageThumbnails[index]}
                                  alt={`Page ${pageNumber}`}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "contain",
                                    borderRadius: "4px",
                                    marginLeft: "10px",
                                  }}
                                />
                                <div style={{ marginLeft: "16px" }}>
                                  <span style={{ fontWeight: 700 }}>
                                    Page {pageNumber}
                                  </span>
                                  <br />
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "#a5a5a5",
                                    }}
                                  >
                                    {_Width} × {_Height}
                                  </span>
                                </div>
                              </div>
                            }
                            shouldDismissPopover={false}
                          />
                        );
                      })}
                    </Menu>
                  }
                >
                  <Button
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                    text={getSelectedPagesLabel()}
                    rightIcon="double-caret-vertical"
                  />
                </Popover>
                <Button
                  intent="primary"
                  disabled={loading || saving}
                  onClick={() => {
                    if (selectedPages.length === 0) {
                      // Select all pages if none selected
                      const allPages = store.pages.map((_, idx) => idx + 1);
                      setSelectedPages(allPages);

                      setTimeout(() => {
                        triggerDownload(allPages);
                      }, 0);
                    } else {
                      triggerDownload(selectedPages);
                    }
                  }}
                >
                  {loading || saving
                    ? loading
                      ? `Downloading... ${progress}%`
                      : "Saving..."
                    : "Download"}
                </Button>
              </div>
            }
          >
            <Button>Download</Button>
          </Popover>

          <PreviewDialog
            isPreviewOpen={isPreviewOpen}
            setPreviwOpen={setPreviwOpen}
            preview={preview}
          />
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});
