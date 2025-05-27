import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Spinner } from '@blueprintjs/core';

import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { ElementsSection, SidePanel, SizeSection, TextSection, BackgroundSection, PhotosSection } from 'polotno/side-panel';
import { Workspace } from 'polotno/canvas/workspace';
import { setTranslations } from 'polotno/config';

import { loadFile } from './file';
import { MyDesignsSection } from './sections/my-designs-section';
import UploadPanel from './Page/UploadPanel';
import { TemplatesSection } from './Page/CustomTemplate';

import { useProject } from './project';
import en from './translations/en';

import Topbar from './topbar/topbar';
import { handleGetUserWithTokenDetails } from './API/APICallingAll';
import Loading from './Common/Loading';

setTranslations(en);

const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone
  );
};

const getOffsetHeight = () => {
  let safeAreaInsetBottom = 0;

  if (isStandalone()) {
    // Try to get the safe area inset using env() variables
    const safeAreaInsetBottomString = getComputedStyle(
      document.documentElement
    ).getPropertyValue('env(safe-area-inset-bottom)');
    if (safeAreaInsetBottomString) {
      safeAreaInsetBottom = parseFloat(safeAreaInsetBottomString);
    }

    // Fallback values for specific devices if env() is not supported
    if (!safeAreaInsetBottom) {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;

      if (/iPhone|iPad|iPod/i.test(userAgent) && !window.MSStream) {
        // This is an approximation; you might need to adjust this value based on testing
        safeAreaInsetBottom = 20; // Example fallback value for iPhone
      }
    }
  }

  return window.innerHeight - safeAreaInsetBottom;
};

const useHeight = () => {
  const [height, setHeight] = React.useState(getOffsetHeight());
  React.useEffect(() => {
    window.addEventListener('resize', () => {
      setHeight(getOffsetHeight());
    });
  }, []);
  return height;
};

const App = observer(({ store }) => {
  const project = useProject();
  const height = useHeight();
  const url = window.location.href;
  // const pathSegments = window.location.pathname.split('/');
  const params = new URLSearchParams(new URL(url).search);
  const TokenId = params.get('ID');
  const token = sessionStorage.getItem('disploy_studio_token');
  const [loading, setLoading] = useState(TokenId && !token ? true : false);
  // const TokenId = pathSegments[pathSegments.length - 1]; 

  // useEffect(() => {
  //   if (!TokenId && !token) {
  //     // window.location.href = "https://web.disploy.com/";
  //     window.location.href = "https://web.qbisinc.com/";
  //   }
  // }, [TokenId, token])

  React.useEffect(() => {
    if (project.language.startsWith('fr')) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith('id')) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith('ru')) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith('pt')) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith('zh')) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }

  }, [project.language]);

  React.useEffect(() => {
    project.firstLoad();
  }, []);

  const fechToken = async () => {
    if (TokenId) {
      const id = atob(TokenId)
      const res = await handleGetUserWithTokenDetails(id);
      if (res?.status === 200) {
        sessionStorage.setItem('disploy_studio_token', res.data.data.data.token)
        // window.location.href = "https://www.disploy.com/studio/";
        setLoading(false)
      }
    }
  }

  React.useEffect(() => {
    if (loading) {
      fechToken()
    }
  }, [loading]);

  const handleDrop = (ev) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer.files.length !== ev.dataTransfer.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  // Track store changes to update localStorage with isChanging flag
  // useEffect(() => {
  //   if (!store) return;
  //   const setIsChangingTrue = () => {
  //     sessionStorage.setItem("isSaveTemplate", true);
  //   };
  //   // Listen to any changes in the store
  //   const unsub = store.on('change', setIsChangingTrue);

  //   // Clean up on unmount
  //   return () => {
  //     unsub();
  //   };
  // }, [store]);

  const sections = [MyDesignsSection, UploadPanel, TemplatesSection, TextSection, PhotosSection, ElementsSection, SizeSection, BackgroundSection]

  return (
    <>
      {loading && (
        <Loading />
      )}
      {!loading && (
        <div
          style={{ width: '100vw', height: height + 'px', display: 'flex', flexDirection: 'column' }}
          onDrop={handleDrop}
        >
          <Topbar store={store} />
          <div style={{ height: 'calc(100% - 50px)' }}>
            <PolotnoContainer>
              <SidePanelWrap>
                <SidePanel store={store} sections={sections} />
              </SidePanelWrap>
              <WorkspaceWrap>
                <Toolbar store={store} />
                <Workspace store={store} />
                <ZoomButtons store={store} />
                {/* <PagesTimeline store={store} /> */}
              </WorkspaceWrap>
            </PolotnoContainer>
          </div>
          {project.status === 'loading' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                }}
              >
                <Spinner />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
});

export default App;
