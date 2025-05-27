import React, { useState } from "react";
import { observer } from "mobx-react-lite";
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
} from "@blueprintjs/core";
import styled from "polotno/utils/styled";
import SaveFileDialog from "../Page/DialogSaveFile";
import { saveAssetsAction } from "../API/APICallingAll";
import PreviewDialog from "../Page/DialogPreview";

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
  const [selection, setSelection] = useState("all");
  const [fromPage, setFromPage] = useState("");
  const [toPage, setToPage] = useState("");

  const generateFileName = () => {
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const currentDate = new Date().toISOString().split("T")[0];
    return `disploy-${randomNumber}-${currentDate}`;
  };

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isPreviewOpen, setPreviwOpen] = useState(false);
  const [fileName, setFileName] = useState(generateFileName());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

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

    if (selection === "custom") {
      const from = parseInt(fromPage, 10) - 1;
      const to = parseInt(toPage, 10);
      if (
        isNaN(from) ||
        isNaN(to) ||
        from < 0 ||
        to <= from ||
        to > allPages.length
      ) {
        alert("Please enter a valid page range.");
        return null;
      }
      return allPages.slice(from, to);
    }

    return allPages;
  };

  const saveAssetsImage = async () => {
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

        const image = await store.toDataURL({ pixelRatio: 2 });
        const blob = dataURLToBlob(image);
        const formData = new FormData();
        formData.append("File", blob, "image.png");
        formData.append("Operation", "Insert");
        formData.append("AssetType", "Image");
        formData.append("IsActive", true);
        formData.append("IsDelete", false);
        formData.append("FolderID", 0);
        await saveAssetsAction(formData);

        const link = document.createElement("a");
        link.href = image;
        link.download = `${fileName}-page-${i + 1}.png`;
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
                }}
              >
                <RadioGroup
                  onChange={(e) => setSelection(e.target.value)}
                  selectedValue={selection}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: "30px",
                  }}
                >
                  <Radio label="All" value="all" />
                  <Radio label="Custom" value="custom" />
                </RadioGroup>

                {selection === "custom" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <InputGroup
                      placeholder="From"
                      value={fromPage}
                      onChange={(e) => setFromPage(e.target.value)}
                    />
                    <InputGroup
                      placeholder="To"
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value)}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    disabled={loading}
                    intent="primary"
                    onClick={downloadVideo}
                  >
                    {loading
                      ? progress > 0
                        ? `Downloading... ${progress}%`
                        : "Downloading..."
                      : "Save Video"}
                  </Button>
                  <Button intent="primary" onClick={saveAssetsImage}>
                    {saving ? "Saving..." : "Save Assets"}
                  </Button>
                </div>
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
          <SaveFileDialog
            isDialogOpen={isDialogOpen}
            setDialogOpen={setDialogOpen}
            fileName={fileName}
            setFileName={setFileName}
            loading={loading}
            progress={progress}
            saving={saving}
            preview={preview}
            downloadVideo={downloadVideo}
            saveAssetsImage={saveAssetsImage}
          />
        </Navbar.Group>
      </NavInner>
    </NavbarContainer>
  );
});

// Function to save current design as JSON
// const saveTemplate = async () => {
//   const json = store.toJSON();
//   const Preview = await store.toDataURL();
//   const payload = {
//     previewImage: Preview,
//     templateJson: JSON.stringify(json),
//   };
//   saveMyTemplateAction(payload);
// };
