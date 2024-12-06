import { useContext } from 'react';
import { Nav } from './components/Nav';
import { useOutlet, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const Layout = ({
  noPadding = false,
  children = null,
  isLanding = false,
}: {
  noPadding?: boolean;
  children?: any;
  isLanding?: boolean;
}) => {
  const authInfo = useContext(AuthContext);
  const showSignIn = authInfo.user === undefined;
  const location = useLocation(); // Use the location hook to get the current route
  // Function to decide whether to hide certain nav items based on the current route
  const shouldHideHeaderItems = () => {
    // List of routes where you don't want to show "Full Exams" and "Section Exams"
    const routesWithoutHeaderItems = ['/some-page', '/another-page'];
    return routesWithoutHeaderItems.includes(location.pathname);
  };

  const getNavEntries = () => {
    if (isLanding) {
      return [
        { text: 'About', to: '""' },
        { text: 'How to use', to: '"' },
        ...(showSignIn ? [{ text: 'Sign in', to: '/sign-in' }] : []),
      ];
    } else if (authInfo.user) {
      return [
        ...(shouldHideHeaderItems() // Conditionally remove these items
          ? []
          : [
              { text: 'Full Exams', to: '/Full-Exam' },
              { text: 'Section Exams', to: '/Sections' },
            ]),
        { text: 'Exercises', to: '/Exercises' },
      ];
    } else {
      return [
        { text: 'About', to: '"' },
        { text: 'How to use', to: '""' },
        { text: 'Sign in', to: '/sign-in' },
      ];
    }
  };

  const navEntries = getNavEntries();

  const containerClasses = noPadding ? '' : 'px-6 py-8 sm:px-10 sm:py-12';

  if (!children) {
    children = useOutlet();
  }

  return (
    <main className="bg-grey-1 min-h-screen">
      <Nav entries={navEntries} />
      <div className={containerClasses}>{children}</div>
    </main>
  );
};
