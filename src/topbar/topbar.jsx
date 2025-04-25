import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Navbar,
  Alignment,
  AnchorButton,
  EditableText,
  Popover,
  Button,
} from '@blueprintjs/core';

import MdcCloudAlert from '@meronex/icons/mdc/MdcCloudAlert';
import MdcCloudCheck from '@meronex/icons/mdc/MdcCloudCheck';
import MdcCloudSync from '@meronex/icons/mdc/MdcCloudSync';
import styled from 'polotno/utils/styled';

import { useProject } from '../project';
import SaveFileDialog from '../Page/DialogSaveFile';

import { FileMenu } from './file-menu';
import { DownloadButton } from './download-button';
import { saveAssetsAction, saveMyTemplateAction } from '../API/APICallingAll';

const NavbarContainer = styled('div')`
  white-space: nowrap;

  @media screen and (max-width: 500px) {
    overflow-x: auto;
    overflow-y: hidden;
    max-width: 100vw;
  }
`;

const NavInner = styled('div')`
  @media screen and (max-width: 500px) {
    display: flex;
  }
`;


export default observer(({ store }) => {

  const generateFileName = () => {
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
    const currentDate = new Date().toISOString().split('T')[0];
    return `disploy-${randomNumber}-${currentDate}`;
  };

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState(generateFileName());
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [designsLoadings, setDesignsLoading] = useState(false);
  const [preview, setPreview] = useState(null);

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
    setSaving(true);
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

      setTimeout(() => {
        sessionStorage.setItem("disploy_studio_token", "");
        window.close();
      }, 300); // Wait briefly before closing  // Close current window

      setSaving(false);
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  };

  const downloadVideo = async () => {
    setProgress(0);
    setLoading(true)
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
    } catch (e) {
      console.error(e);
      alert("Something went wrong...");
    }

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
    setProgress(0);
    setLoading(false)

    setTimeout(() => {
      sessionStorage.setItem("disploy_studio_token", "");
      window.close();
    }, 300); // Wait briefly before closing  // Close current windowF

  };

  // Function to save current design as JSON
  const saveTemplate = async () => {
    const json = store.toJSON();
    const Preview = await store.toDataURL()
    const payload = {
      previewImage: Preview,
      templateJson: JSON.stringify(json),
    }
    saveMyTemplateAction(payload)
  };

  const getBtn = sessionStorage.getItem("isSaveTemplate")

  const preparePreview = async () => {
    const previewImage = await store.toDataURL();
    setPreview(previewImage);
    setDialogOpen(true);
  };
  
  return (
    <NavbarContainer className="bp5-navbar">
      <NavInner>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button onClick={preparePreview}>Download</Button>
          {/* <Button
            disabled={!getBtn}
            onClick={saveTemplate}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: '#252a31',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: "10px"
            }}
          >
            Save Template
          </Button> */}
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
