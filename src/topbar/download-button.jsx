import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Position,
  Menu,
  HTMLSelect,
  Slider,
  Popover,
  ProgressBar,
} from '@blueprintjs/core';
import { Import } from '@blueprintjs/icons';
import JSZip from 'jszip';
import { downloadFile } from 'polotno/utils/download';
import * as unit from 'polotno/utils/unit';
import { t } from 'polotno/utils/l10n';
import { saveAssetsAction } from '../API/APICallingAll';

const saveAsVideo = async ({ store, pixelRatio, fps, onProgress }) => {
  const json = store.toJSON();
  const req = await fetch(
    'https://api.polotno.dev/api/renders?KEY=nFA5H9elEytDyPyvKL7T',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        design: json,
        pixelRatio,
        format: 'mp4',
      }),
    }
  );
  const job = await req.json();
  while (true) {
    const jobReq = await fetch(
      `https://api.polotno.dev/api/renders/${job.id}?KEY=nFA5H9elEytDyPyvKL7T`
    );
    const jobData = await jobReq.json();
    if (jobData.status === 'done') {
      downloadFile(jobData.output, 'polotno.mp4');
      break;
    } else if (jobData.status === 'error') {
      throw new Error('Failed to render video');
    } else {
      onProgress(jobData.progress, jobData.status);
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
};

export const DownloadButton = observer(({ store }) => {
  const [saving, setSaving] = React.useState(false);
  const [quality, setQuality] = React.useState(1);
  const [pageSizeModifier, setPageSizeModifier] = React.useState(1);
  const [fps, setFPS] = React.useState(10);
  const [type, setType] = React.useState('png');
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState('scheduled');

  const getName = () => {
    const texts = [];
    store.pages.forEach((p) => {
      p.children.forEach((c) => {
        if (c.type === 'text') {
          texts.push(c.text);
        }
      });
    });
    const allWords = texts.join(' ').split(' ');
    const words = allWords.slice(0, 6);
    return words.join(' ').replace(/\s/g, '-').toLowerCase() || 'polotno';
  };

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

  const saveAssetsImageOrVideo = async () => {
    setSaving(true);
    try {
      // Convert image to Base64
      const imageBase64 = await store.toDataURL({ pixelRatio: quality, mimeType: 'image/' + type });
      const blob = dataURLToBlob(imageBase64);
      const formData = new FormData();
      formData.append('File', blob, 'image.png');
      formData.append('Operation', 'Insert');
      formData.append('AssetType', 'Image');
      formData.append('IsActive', true);
      formData.append('IsDelete', false);
      formData.append('FolderID', 0);
      await saveAssetsAction(formData)   // APi Action

      // save image
      store.pages.forEach((page, index) => {
        const indexString = store.pages.length > 1 ? '-' + (index + 1) : '';
        store.saveAsImage({
          pageId: page.id,
          pixelRatio: quality,
          mimeType: 'image/' + type,
          fileName: getName() + indexString + '.' + type,
        });
      });

      setSaving(false);
    } catch (error) {
      console.log('saveAssetsImageOrVideo >>>> ', error)
    }
  }



  const downloadVideo = async () => {
    setProgress(0);
    try {

      const designData = store.toJSON();
      if (!designData.pages || designData.pages.length === 0) {
        console.log(' >>>>>>>>>>   Cannot render video: No content in design.')
        return;
      }


      const response = await fetch('https://api.polotno.com/api/renders?KEY=nFA5H9elEytDyPyvKL7T', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          design: store.toJSON(),
          pixelRatio: "2",
          dpi: "150",
          fps: "15",
          format: "mp4",
          outputFormat: "url",
        }),
      });

      if (!response.ok) {
        throw new Error('Error initiating video render : response.ok');
      }

      const renderData = await response.json();
      const renderId = renderData.id;

      if (!renderData.id) {
        throw new Error('Invalid response, check API logs');
      }

      // Step 2: 
      for (let i = 0; i < 100; i++) {
        const req = await fetch(`https://api.polotno.com/api/renders/${renderId}?KEY=nFA5H9elEytDyPyvKL7T`);
        if (!req.ok) {
          console.error("Error fetching render status:", req.status);
          break;
        }

        const job = await req.json();

        console.log('i >>>>>>>>>>>>>>>>> ', i)

        if (job.status === "error") {
          console.log('job.error', job)
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
    } catch (e) {
      console.error("catch >>>>>>>>>> ", e);
      alert("Something went wrong...");
    }
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
    // Focus and close windows
    if (window.opener) {
      window.opener.focus();  // Focus the parent window
    }
    window.close();  // Close current window

  };


  return (
    <Popover
      content={
        <Menu>
          <li className="bp5-menu-header">
            <h6 className="bp5-heading">File type</h6>
          </li>
          <HTMLSelect
            fill
            onChange={(e) => {
              setType(e.target.value);
              setQuality(1);
            }}
            value={type}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="pdf">PDF</option>
            <option value="mp4">MP4 Video </option>
          </HTMLSelect>

          {type !== "mp4" &&
            <Button
              fill
              intent="primary"
              loading={saving}
              onClick={saveAssetsImageOrVideo}
            >
              {saving && (
                <div
                  style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}
                >
                  <ProgressBar value={Math.max(3, progress) / 100} />
                </div>
              )}
              Download {type.toUpperCase()}
            </Button>
          }

          {type == "mp4" &&
            <Button
              fill
              intent="primary"
              loading={saving}
              onClick={downloadVideo}
              style={{ marginTop: "10px" }}
            >
              {saving && (
                <div
                  style={{ padding: '10px', maxWidth: '180px', opacity: 0.8 }}
                >
                  <ProgressBar value={Math.max(3, progress) / 100} />
                </div>
              )}
              Download Video
            </Button>
          }

        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        icon={<Import />}
        text={t('toolbar.download')}
        intent="primary"
        loading={saving}
        onClick={() => {
          setQuality(1);
        }}
      />
    </Popover>
  );
});
