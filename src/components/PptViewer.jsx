const PptViewer = ({ fileUrl }) => {
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    fileUrl
  )}`;

  return (
    <div className="w-full h-screen">
      <iframe src={viewerUrl} className="w-full h-full" />
    </div>
  );
};

export default PptViewer;
