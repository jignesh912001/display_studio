import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import axios from 'axios';
import { SectionTab } from 'polotno/side-panel';
import MdPhotoLibrary from '@meronex/icons/md/MdPhotoLibrary';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

export const TemplatesPanel = observer(({ store }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://back.disploy.com/api/CanvaMaster/GetAllCanvaTemplateMaster');
        if (response.data && response.data.data) {
          const result = await response.data?.data;
          setData(result.items || []);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div style={{ height: '100%' }}>
      <ImagesGrid
        shadowEnabled={false}
        images={data}
        getPreview={(item) => item.preview}
        isLoading={isLoading}
        onSelect={async (item) => {
          const req = await fetch(item.json);
          const json = await req.json();
          store.loadJSON(json);
        }}
        rowsNumber={2}
      />
    </div>
  );
});

export const TemplatesSection = {
  name: 'custom-templates',
  Tab: (props) => (
    <SectionTab name="Templates" {...props}>
      <MdPhotoLibrary />
    </SectionTab>
  ),
  Panel: TemplatesPanel,
};
