import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Button,
    Card,
    Menu,
    MenuItem,
    Position,
    Spinner,
    Popover,
} from '@blueprintjs/core';


import { SectionTab } from 'polotno/side-panel';
import FaFolder from '@meronex/icons/fa/FaFolder';
import { getPreview, listDesigns, saveDesign } from '../API/APICallingAll';




const DesignCard = observer(({ design, store, onDelete }) => {
    const [loading, setLoading] = React.useState(false);
    const [previewURL, setPreviewURL] = React.useState(design.previewURL);
  
    React.useEffect(() => {
      const load = async () => {
        try {
          const url = await getPreview({ id: design.id });
          setPreviewURL(url);
        } catch (e) {
          console.error(e);
        }
      };
      load();
    }, []);
  
  
    return (
      <Card
        style={{ margin: '3px', padding: '0px', position: 'relative' }}
        interactive >
        <img src={previewURL} style={{ width: '100%', minHeight: '100px' }} />
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '3px',
          }}
        >
          {design.name || 'Untitled'}
        </div>
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Spinner />
          </div>
        )}
      </Card>
    );
  });
  


export const MyDesignsPanel = observer(({ store }) => {
    const [designsLoadings, setDesignsLoading] = React.useState(false);
    const [designs, setDesigns] = React.useState([]);


    const loadDesigns = async () => {
        setDesignsLoading(true);
        const list = await listDesigns();
        setDesigns(list);
        setDesignsLoading(false);
    };

    useEffect(() => {
        loadDesigns();
    }, []);

    const createNewDesign = async () => {
        const Id = ""
        const name = ""

        store.clear();
        store.addPage();
        await localStorage.removeItem('polotno-last-design-id');

        const storeJSON = store.toJSON();
        const maxWidth = 200;
        const canvas = store.pages.length ? await store._toCanvas({ pixelRatio: maxWidth / store.activePage?.computedWidth, pageId: store.activePage?.id, quickMode: true, _skipTimeout: true }) : document.createElement('canvas');
        const blob = await new Promise((resolve) => { canvas.toBlob(resolve, 'image/jpeg', 0.9) });
        try {
            console.log('storeJSON', storeJSON)
            const res = await saveDesign({ storeJSON, preview: blob, id: Id, name: name });
            if (res.status === 'saved') {
                Id = res.id;
                await localStorage.setItem('polotno-last-design-id', res.id);
            }
        } catch (error) {
            console.log("createNewDesign ====>", error);
        }
    }

    const half1 = [];
    const half2 = [];
    const designsArray = Array.isArray(designs) ? designs : [];
    designsArray.forEach((design, index) => {
        if (index % 2 === 0) {
            half1.push(design);
        } else {
            half2.push(design);
        }
    });

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Button
                fill
                intent="primary"
                onClick={() => { createNewDesign() }}
            >
                Create new design
            </Button>

            {!designsLoadings && !designsArray.length && (
                <div style={{ paddingTop: '20px', textAlign: 'center', opacity: 0.6 }}>
                    You have no saved designs yet...
                </div>
            )}

            {designsLoadings && (
                <div style={{ padding: '30px' }}>
                    <Spinner />
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    paddingTop: '5px',
                    height: '100%',
                    overflow: 'auto',
                }}
            >
                <div style={{ width: '50%' }}>
                    {half1.map((design) => (
                        <DesignCard
                            design={design}
                            key={design.id}
                            store={store}
                        // onDelete={handleProjectDelete}
                        />
                    ))}
                </div>
                <div style={{ width: '50%' }}>
                    {half2.map((design) => (
                        <DesignCard
                            design={design}
                            key={design.id}
                            store={store}
                        // onDelete={handleProjectDelete}
                        />
                    ))}
                </div>
            </div>
        </div>

    );
});

// define the new custom section
export const MyDesignsSection = {
    name: 'my-designs',
    Tab: (props) => (
        <SectionTab name="My Designs" {...props}>
            <FaFolder />
        </SectionTab>
    ),
    // we need observer to update component automatically on any store changes
    Panel: MyDesignsPanel,
};
