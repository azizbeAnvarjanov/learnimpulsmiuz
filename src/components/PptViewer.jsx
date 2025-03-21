// const PptViewer = ({ fileUrl }) => {
//   const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
//     fileUrl
//   )}`;

//   return (
//     <div className="w-full h-[50vh] md:h-screen">
//       <iframe src={viewerUrl} className="w-full h-full" />
//     </div>
//   );
// };

// export default PptViewer;

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const PptViewerTabs = ({ notes }) => {
  if (notes.length === 0) {
    return <h1 className="p-2 text-wrap">Prizentatsiya fayli mavjud memas!</h1>;
  }

  return (
    <Tabs defaultValue={notes[0]?.url} className="w-full">
      <TabsList className="flex overflow-x-auto items-center justify-start rounded-none">
        {notes.map((note, index) => (
          <TabsTrigger key={index} value={note.url}>
            {note.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {notes.map((note, index) => (
        <TabsContent key={index} value={note.url}>
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              note.url
            )}`}
            className="w-full h-[50vh] md:h-screen border pb-32"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PptViewerTabs;
