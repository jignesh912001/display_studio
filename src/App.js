import React from 'react';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { DEFAULT_SECTIONS, SidePanel } from 'polotno/side-panel';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { createStore } from 'polotno/model/store';


import Topbar from './Page/Topbar/topbar';


const store = createStore({
  key: 'nFA5H9elEytDyPyvKL7T',
  showCredit: true,
});
window.store = store;

store.addPage();

const Canvas = () => {
  return (
    <>
      <Topbar />
      {/* <PolotnoContainer className="polotno-app-container"> */}
        {/* <SidePanelWrap>
          <SidePanel store={store} />
        </SidePanelWrap> */}
        <WorkspaceWrap>
          <Toolbar store={store} components={{}} />
          <Workspace store={store} />
          <ZoomButtons store={store} />
          <PagesTimeline store={store} />
        </WorkspaceWrap>
      {/* </PolotnoContainer> */}
    </>
  );
};

const App = () => {
  return (
    <div className="">
      <Canvas />
    </div>
  );
}

export default App;
