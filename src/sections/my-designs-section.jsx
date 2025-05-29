import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { Button, Spinner } from "@blueprintjs/core";
import { ImagesGrid, SectionTab } from "polotno/side-panel";
import FaFolder from "@meronex/icons/fa/FaFolder";
import { useProject } from "../project";
import {
  fetchTemplateJsonMyDesign,
  getMyTemplateAction,
  saveMyTemplateAction,
} from "../API/APICallingAll";
import LoadingBar from "react-top-loading-bar";
import SaveAlert from "../Page/AlertDialog";

export const MyDesignsPanel = observer(({ store }) => {
  const project = useProject();
  const [designsLoadings, setDesignsLoading] = React.useState(true);
  const [designs, setDesigns] = React.useState([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // Dialog control
  const progressRef = useRef(null); // Ref for progress bar

  const loadDesigns = async () => {
    setDesignsLoading(true);
    const respons = await getMyTemplateAction();
    const data = respons?.data?.data;
    if (respons.status === 200) {
      setDesigns(data);
    }
    setDesignsLoading(false);
  };

  React.useEffect(() => {
    loadDesigns();
  }, [project.designsLength]);

  const fetchTemplateJson = async (id) => {
    try {
      progressRef.current.continuousStart();
      const payload = { canvaMyDesignsID: id };
      const response = await fetchTemplateJsonMyDesign(payload);
      const data = response.data.data;
      const json = await JSON.parse(data.templateJson);
      store.loadJSON(json);
      progressRef.current.complete(); // Hide progress bar on success
    } catch (error) {
      console.error("Error fetching template JSON:", error);
      progressRef.current.staticStart(); // Keep progress bar visible on error
      return null;
    }
  };

  const handleCreateNewDesign = async () => {
    const isSaveRequired = sessionStorage.getItem("isSaveTemplate") == "true";
    if (isSaveRequired) {
      setIsDialogOpen(true);
    } else {
      await project.createNewDesign();
      setIsDialogOpen(false);
    }
  };

  const handleDialogYes = async () => {
    setIsDialogOpen(false);
    await saveTemplate();
    await project.createNewDesign();
    sessionStorage.setItem("isSaveTemplate", false);
  };

  const handleDialogNo = async () => {
    setIsDialogOpen(false);
  };

  // Clear session and close dialog
  const handleClearSession = async () => {
    await localStorage.clear()
    await sessionStorage.removeItem("isSaveTemplate"); 
    await project.createNewDesign();
    setIsDialogOpen(false);
  };


  // Function to save current design as JSON
  const saveTemplate = async () => {
    try {
      progressRef.current.continuousStart();
      const json = store.toJSON();
      const Preview = await store.toDataURL();
      const payload = {
        previewImage: Preview,
        templateJson: JSON.stringify(json),
        "file": {
          "fileType": "Template",
          "filePath": Preview,
          "fileName": `Template-${designs?.length + 1}.png`,
          "isChange": true
        }
      };
      await saveMyTemplateAction(payload);
      loadDesigns();
      sessionStorage.setItem("isSaveTemplate", false);
      progressRef.current.complete(); // Hide progress bar on success
      sessionStorage.removeItem()
    } catch (error) {
      console.error("Error fetching template JSON saveTemplate :", error);
      progressRef.current.staticStart(); // Keep progress bar visible on error
      return null;
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Progress Bar */}
      <LoadingBar color="#f11946" ref={progressRef} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Button
          fill
          style={{ flex: "1" }}
          intent="primary"
          onClick={handleCreateNewDesign}
        >
          Create new design
        </Button>
        <Button
          onClick={saveTemplate}
          style={{
            background: "#252a31",
            color: "white",
            border: "none",
            cursor: "pointer",
            flex: "1",
          }}
        >
          Save Template
        </Button>
      </div>

      {!designsLoadings && designs?.length === 0 ? (
        <div style={{ padding: '30px', display: "flex", alignItems: "center", justifyContent: "center" }}>No results</div>
      ) : designsLoadings ? (
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            paddingTop: "5px",
            height: "100%",
            overflow: "auto",
          }}
        >
          <ImagesGrid
            images={designs}
            getPreview={(image) => image.previewImage}
            onSelect={async (item) => {
              await fetchTemplateJson(item.canvaMyDesignsID);
              sessionStorage.setItem("isSaveTemplate", true);
            }}
            rowsNumber={2}
            isLoading={!designs.length}
            loadMore={false}
          />
        </div>
      )}


      <SaveAlert
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleDialogNo={handleDialogNo}
        handleDialogYes={handleDialogYes}
        handleClearSession={handleClearSession}
      />


    </div>
  );
});


// define the new custom section
export const MyDesignsSection = {
  name: "my-designs",
  Tab: (props) => (
    <SectionTab name="My Designs" {...props}>
      <FaFolder />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
