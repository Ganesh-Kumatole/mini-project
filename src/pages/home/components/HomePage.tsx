import { useAuthContext } from '@/shared/context';
import { Header, Main, Footer } from './';

const HomePage = () => {
  const { user } = useAuthContext();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark selection:bg-indigo-500/30 transition-colors duration-300 flex flex-col overflow-hidden">
      <Header user={user} />
      <Main user={user} />
      <Footer />
    </div>
  );
};

export { HomePage };
