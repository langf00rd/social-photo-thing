export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-[800px] space-y-20 px-10">
        <div>
          <h1 className="text-xl text-center md:text-[3rem] font-medium">
            A free Instagram photo splitter and collage maker
          </h1>
          <p className="md:hidden text-center mt-10 text-destructive">
            Please open the app on a bigger screen
          </p>
        </div>
      </div>
    </div>
  );
}
