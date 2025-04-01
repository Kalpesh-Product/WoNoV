import { CircularProgress } from "@mui/material";

export default function Loader() {
  return (
    <main className="w-full h-screen flex justify-center items-center">
      <CircularProgress color="black" />
    </main>
  );
}
