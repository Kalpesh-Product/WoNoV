import GoogleFolderCard from "../../../../components/GoogleFolderCard";

const DirectorsCompany = () => {
  const folderData = [
    {
      id: 1,
      title: "Abrar Shaikh",
      files: [
        { id: 1, label: "Passport", link: "link here" },
        { id: 2, label: "License", link: "link here" },
        { id: 3, label: "Aadhar", link: "link here" },
      ],
    },
    {
      id: 2,
      title: "Kashif Shaikh",
      files: [
        { id: 1, label: "Passport", link: "link here" },
        { id: 2, label: "License", link: "link here" },
      ],
    },
    {
      id: 3,
      title: "Nasreen Shaikh",
      files: [
        { id: 1, label: "Passport", link: "link here" },
        { id: 2, label: "License", link: "link here" },
      ],
    },
    {
      id: 4,
      title: "Kabir Shaikh",
      files: [
        { id: 1, label: "Passport", link: "link here" },
        { id: 2, label: "License", link: "link here" },
      ],
    },
  ];
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folderData.map((item) => (
        <div key={item.id}>
          <GoogleFolderCard title={item.title} routeId={item.id} files={item.files} />
        </div>
      ))}
    </div>
  );
};

export default DirectorsCompany;
