import Navbar from "@/components/Navbars/Navbar";
import TopNavbar from "../../components/Navbars/TopNavbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-screen h-screen overflow-x-hidden ">
      <TopNavbar/>
      <Navbar />
      <section className="">{children}</section>
    </main>
  );
};

export default layout;
