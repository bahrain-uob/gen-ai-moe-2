import React, { useContext, useState, useEffect } from 'react';
import { Link, To } from 'react-router-dom'; // Ensure To is imported
import {
  BsArrowRight,
  BsBoxArrowRight,
  BsList,
  BsPersonCircle,
} from 'react-icons/bs';
import { AuthContext, AuthInfo } from '../AuthContext';
import { toJSON } from '../utilities';
import { get } from 'aws-amplify/api';
import badge3 from '../assets/3.png';
import badge7 from '../assets/7.png';
import badge14 from '../assets/14.png';
import badge30 from '../assets/30.png';

const MILESTONES = [3, 7, 14, 30];
const milestoneImages: Record<number, string> = {
  3: badge3,
  7: badge7,
  14: badge14,
  30: badge30,
};

type NavProps = {
  showLogo?: boolean;
  entries?: Entry[];
  isLanding?: boolean;
};

type Entry = { text: string; to: To };

const _containerStyling = 'flex flex-1 font-montserrat text-md text-white ';

export const Nav: React.FC<NavProps> = props => {
  const { showLogo = true, entries = [], isLanding = false } = props;

  const authInfo = useContext(AuthContext);
  const [streakCounter, setStreakCounter] = useState<number>(0);

  useEffect(() => {
    toJSON(
      get({
        apiName: 'myAPI',
        path: '/getUserLevel',
      }),
    )
      .then(response => {
        setStreakCounter(response.StreakCounter || 0);
      })
      .catch(error => {
        console.error('Error fetching streak:', error);
      });
  }, []);

  const milestoneBadge =
    streakCounter && MILESTONES.includes(streakCounter)
      ? milestoneImages[streakCounter]
      : null;

  const itemStyle = 'nav-item hover-darken';

  const logo = showLogo ? (
    <Link
      className={`${itemStyle} text-xl font-bold px-7 flex items-center`}
      to="/"
    >
      <div>LINGUI</div>
      {milestoneBadge && (
        <img
          src={milestoneBadge}
          alt={`Milestone ${streakCounter}`}
          className="w-8 h-8 ml-4"
        />
      )}
    </Link>
  ) : null;

  const getLinkClass = (text: string) => {
    if (text === 'SIGN IN') {
      return `${itemStyle} font-bold ml-auto`;
    }
    return itemStyle;
  };

  const links = entries.map(({ text, to }, index) => (
    <Link className={getLinkClass(text) + ' max-md:hidden'} to={to} key={index}>
      <div>{text}</div>
    </Link>
  ));

  // links.push(
  //   <Link className={itemStyle} to="/achievements">
  //     <div>Achievements</div>
  //   </Link>
  // );

  return (
    <header className="z-10 w-full">
      <nav className="bg-blue-4 h-14">
        <div className={`${_containerStyling} h-full`}>
          {logo}
          {links}
          {!isLanding && <ProfileMenu user={authInfo.user} />}
          <MobileMenu
            className={`${itemStyle} md:hidden ml-auto`}
            entries={entries}
          />
        </div>
      </nav>
    </header>
  );
};

const MobileMenu = ({
  className = '',
  entries,
}: {
  className: string;
  entries: Entry[];
}) => {
  const itemStyle = 'nav-item hover-darken py-3 flex-row text-gray-700 ';

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(s => !s);

  const links = entries.map(({ text, to }, index) => (
    <button key={index} onClick={toggleMenu}>
      <Link className={itemStyle} to={to}>
        <div>{text}</div>
      </Link>
    </button>
  ));

  // links.push(
  //   <button key="achievements" onClick={toggleMenu}>
  //     <Link className={itemStyle} to="/achievements">
  //       <div>Achievements</div>
  //     </Link>
  //   </button>
  // );

  return (
    <>
      <button className={className} onClick={toggleMenu}>
        <BsList size="35" />
      </button>
      <div
        className={`
          h-dvh bg-grey-1 fixed top-0 right-0 z-50 ${isOpen ? 'max-w-[60vw] ' : 'max-w-0'
          } transition-all duration-300 overflow-hidden`}
      >
        <div className={`${_containerStyling} flex-col w-[60vw] h-dvh`}>
          <button className={itemStyle} onClick={toggleMenu}>
            <span>Back</span>
            <BsArrowRight className="ml-auto" />
          </button>
          {links}
          <button className={`${itemStyle} mt-auto`}>
            <Link to="/sign-in">
              <span>Sign In?</span>
            </Link>
            <Link to="/sign-out">
              <BsBoxArrowRight className="ml-auto" />
            </Link>
          </button>
        </div>
      </div>
      <div
        className={`bg-black ${isOpen ? 'bg-opacity-55 z-20' : 'bg-opacity-0 -z-10'
          } h-screen w-screen fixed top-0 left-0 transition-all duration-300 ease-linear`}
        onClick={() => toggleMenu()}
      ></div>
    </>
  );
};

const ProfileMenu: React.FC<{ user: AuthInfo['user'] }> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(s => !s);

  const linkStyling = 'nav-item hover-darken py-3 flex-row text-gray-700 ';

  const menuContent = (
    <>
      {user && (
        <Link className={linkStyling} to="/sign-out">
          <div>Sign Out</div>
        </Link>
      )}
      {user == undefined && (
        <Link className={linkStyling} to="/sign-in">
          <div>Sign In</div>
        </Link>
      )}
    </>
  );

  return (
    <>
      <span className={'flex ml-auto max-md:hidden relative'}>
        <button className="nav-item hover-darken" onClick={() => toggleMenu()}>
          <BsPersonCircle size="28" />
        </button>
        <div
          className={`fixed right-10 top-10 w-48 bg-grey-3 shadow-2xl rounded-lg ${isOpen ? 'opacity-100 z-30' : 'opacity-0 -z-10'
            } transition-all duration-300 flex flex-col`}
        >
          {menuContent}
        </div>
        <div
          className={`bg-black ${isOpen ? 'bg-opacity-10 z-20' : 'bg-opacity-0 -z-10'
            } h-screen w-screen fixed top-0 left-0 transition-all duration-300 ease-linear`}
          onClick={() => toggleMenu()}
        ></div>
      </span>
    </>
  );
};
