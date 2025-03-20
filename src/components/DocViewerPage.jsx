"use client";

import dynamic from "next/dynamic";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

const DocViewer = dynamic(() => import("@cyntler/react-doc-viewer"), {
  ssr: false,
});

const DocViewerPage = ({ docsarr }) => {
  console.log("Received docsarr:", docsarr);

  let docs = [];

  if (docsarr && Array.isArray(docsarr)) {
    // Agar docsarr allaqachon massiv bo'lsa
    docs = docsarr.map((doc) => ({
      uri: doc.url,
      fileName: doc.name,
    }));
  } else if (typeof docsarr === "string" && docsarr.trim() !== "") {
    try {
      const parsedDocs = JSON.parse(decodeURIComponent(docsarr));

      if (Array.isArray(parsedDocs)) {
        docs = parsedDocs.map((doc) => ({
          uri: doc.url,
          fileName: doc.name,
        }));
      } else {
        console.error("Parsed docsarr is not an array:", parsedDocs);
      }
    } catch (error) {
      console.error("Error parsing docsarr:", error);
    }
  } else {
    console.warn("docsarr is undefined or empty.");
  }

  return (
    <div className="flex flex-col items-center justify-center overflow-hidden">
      {docs.length > 0 ? (
        <div className="w-full border p-4 bg-white rounded shadow-md">
          <DocViewer
            documents={docs}
            config={{
              header: {
                disableHeader: false,
                disableFileName: false,
                retainURLParams: false,
              },
              csvDelimiter: ",", // "," as default,
              pdfZoom: {
                defaultZoom: 1.4, // 1 as default,
                zoomJump: 0.2, // 0.1 as default,
              },
              pdfVerticalScrollByDefault: true, // false as default
            }}
          />
        </div>
      ) : (
        <p className="text-gray-500">No documents available</p>
      )}
    </div>
  );
};

export default DocViewerPage;
