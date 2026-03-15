
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-screen h-screen overflow-x-hidden ">
      <section className="">{children}</section>
    </main>
  );
};

export default layout;
