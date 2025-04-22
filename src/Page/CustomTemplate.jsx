import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import axios from "axios";
import { SectionTab } from "polotno/side-panel";
import MdPhotoLibrary from "@meronex/icons/md/MdPhotoLibrary";

import { ImagesGrid } from "polotno/side-panel/images-grid";
import { getMyTemplateAction } from "../API/APICallingAll";

export const TemplatesPanel = observer(({ store }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    setIsLoading(true);
    setData([]);
    const fetchTemplates = async () => {
      if (activeTab === "all") {
        try {
          const response = await axios.get(
            "https://back.disploy.com/api/CanvaMaster/GetAllCanvaTemplateMaster"
          );
          if (response.data && response.data.data) {
            const result = await response.data?.data;
            setData(result.items || []);
          }
        } catch (error) {
          console.error("Error fetching templates:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        const respons = await getMyTemplateAction();
        const data = respons?.data?.data;
        if (respons.status === 200) {
          setData(data);
          setIsLoading(false);
        }
      }
    };

    fetchTemplates();
  }, [activeTab]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setFilteredImages(images);
    } else {
      const filtered = data.filter( 
        (image) => image.assetName?.toLowerCase().includes(query) // 🔥 Search inside `name`
      );
      // setFilteredImages(filtered);
    }
  };
  console.log('data', data)
  return (
    <div style={{ height: "calc(100% - 100px)" }}>
      <div style={{ display: "flex", marginBottom: "10px" }}>
        <button
          onClick={() => setActiveTab("all")}
          style={tabStyle(activeTab === "all")}
        >
          All Templates
        </button>
        <button
          onClick={() => setActiveTab("my")}
          style={tabStyle(activeTab === "my")}
        >
          My Templates
        </button>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        style={{
          background: "#1114184d",
          border: "none",
          boxShadow:
            "0 0 0 0 rgba(138, 187, 255, 0), 0 0 0 0 rgba(138, 187, 255, 0), inset 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.3)",
          color: "#f6f7f9",
          fontSize: "14px",
          height: "30px",
          borderRadius: "30px",
          appearance: "none",
          outline: "none",
          padding: "0 10px 0 10px",
          width: "100%",
          marginBottom: "20px",
        }}
      />

      <ImagesGrid
        shadowEnabled={false}
        images={data}
        getPreview={(item) =>
          activeTab === "all" ? item.preview : item.previewImage
        }
        isLoading={isLoading}
        onSelect={async (item) => {
          const req = await fetch(item.json);
          const json = await req.json();
          if (json && json.pages) {
            const currentPage = store.activePage;
            json.pages.forEach((page) => {
              page.children.forEach((element) => {
                currentPage.addElement(element);
              });
            });
          }
        }}
        rowsNumber={2}
      />
    </div>
  );
});

const tabStyle = (isActive) => ({
  flex: 1,
  padding: "10px",
  border: "none",
  outline: "none",
  cursor: "pointer",
  background: isActive ? "#333" : "#222",
  color: "white",
  fontWeight: isActive ? "bold" : "normal",
});

export const TemplatesSection = {
  name: "custom-templates",
  Tab: (props) => (
    <SectionTab name="Templates" {...props}>
      <MdPhotoLibrary />
    </SectionTab>
  ),
  Panel: TemplatesPanel,
};
