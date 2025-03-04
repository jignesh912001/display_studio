import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { SidePanel, TextSection, SizeSection, ElementsSection, BackgroundSection } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Button } from '@blueprintjs/core';
import { createStore } from 'polotno/model/store';
import AsstesImage from './Page/AsstesImage';
import { TemplatesSection } from './Page/CustomTemplate';
import VideoSection from './Page/VideoSection';
import SaveFileDialog from './Page/DialogSaveFile';
import UploadPanel from './Page/UploadPanel';
import { saveAssetsAction } from './API/APICallingAll';

const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T',
  showCredit: true,
});

const page = store.addPage();
store.toggleRulers();

const sections = [AsstesImage, UploadPanel, TemplatesSection, VideoSection, TextSection, ElementsSection, SizeSection, BackgroundSection];

const generateFileName = () => {
  const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
  const currentDate = new Date().toISOString().split('T')[0];
  return `disploy-${randomNumber}-${currentDate}`;
};

const CustomToolbar = ({ store }) => {

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState(generateFileName());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);


  const dataURLToBlob = (dataURL) => {
    const parts = dataURL.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const binary = atob(parts[1]);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  };

  const saveAssetsImage = async () => {
    try {
      // console.log('store', store.toJSON())
      const image = await store.toDataURL({ pixelRatio: 2 });
      const blob = dataURLToBlob(image);
      const formData = new FormData();
      formData.append('File', blob, 'image.png');
      formData.append('Operation', 'Insert');
      formData.append('AssetType', 'Image');
      formData.append('IsActive', true);
      formData.append('IsDelete', false);
      formData.append('FolderID', 0);
      await saveAssetsAction(formData)   // APi Action
      const link = document.createElement('a');
      link.href = image;
      link.download = `${fileName}.png`;
      link.click();
      setDialogOpen(false)

    } catch (error) {
      console.error('Error exporting image:', error);
    } finally {
      setDialogOpen(false);
    }
  };

  const downloadVideo = async () => {
    setLoading(true);
    setProgress(0);
    try {
      const response = await fetch('https://api.polotno.com/api/renders?KEY=nFA5H9elEytDyPyvKL7T', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          design: store.toJSON(),
          pixelRatio: "1",
          dpi: "72",
          fps: "10",
          format: "mp4",
          outputFormat: "url",
        }),
      });

      if (!response.ok) {
        throw new Error('Error initiating video render : response.ok');
      }

      const renderData = await response.json();
      const renderId = renderData.id;

      // Step 2: 
      for (let i = 0; i < 100; i++) {
        const req = await fetch(`https://api.polotno.com/api/renders/${renderId}?KEY=nFA5H9elEytDyPyvKL7T`);

        const job = await req.json();
        if (job.status === "error") {
          alert("Error: " + job.error);
          break;
        }
        if (job.status === "progress") {
          setProgress(job.progress);
        }
        if (job.status === "done") {
          const url = job.output;
          downloadFile(url, fileName + "." + "mp4");
          break;
        }
        // wait a bit
        await new Promise((r) => setTimeout(r, 1000));
      }
      setDialogOpen(false)
    } catch (e) {
      console.error(e);
      alert("Something went wrong...");
    }
    setLoading(false);
    setProgress(0);
  };

  // video button
  const downloadFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('File', blob, 'video.mp4');
    formData.append('Operation', 'Insert');
    formData.append('AssetType', 'Video');
    formData.append('IsActive', true);
    formData.append('IsDelete', false);
    formData.append('FolderID', 0);
    await saveAssetsAction(formData)   // APi Action
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f5f5f5' }}>
        <Button onClick={() => setDialogOpen(true)}>Download</Button>
      </div>

      <SaveFileDialog
        loading={loading}
        progress={progress}
        isDialogOpen={isDialogOpen}
        setDialogOpen={setDialogOpen}
        fileName={fileName}
        setFileName={setFileName}
        downloadVideo={downloadVideo}
        saveAssetsImage={saveAssetsImage}
      />

    </>
  );
};

export const App = ({ store }) => {
  return (
    <div style={{ display: 'flex', height: '100%', margin: 'auto', flex: 1, flexDirection: 'column', position: 'relative' }} >
      <PolotnoContainer>
        <SidePanelWrap>
          <SidePanel
            store={store}
            sections={sections}
            defaultSection="assetsImage"
          />
        </SidePanelWrap>
        <WorkspaceWrap>
          <CustomToolbar store={store} />
          <Toolbar store={store} />
          <Workspace store={store} />
          <ZoomButtons store={store} />
          <PagesTimeline store={store} />
        </WorkspaceWrap>
      </PolotnoContainer>

    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App store={store} />);
