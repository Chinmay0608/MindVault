import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
