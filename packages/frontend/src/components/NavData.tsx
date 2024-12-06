//libraries to import icons
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { ReactNode } from 'react';

// the type for each sidebar item
export interface SidebarItem {
  title: string;
  path: string;
  icon: ReactNode; // The icon is a React component
  cName: string; // for styling - css
  subItems?: { title: string; path: string }[]; //  optional
}

export const NavData: SidebarItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <AiIcons.AiOutlineDashboard />,
    cName: 'nav-text',
  },
  {
    title: 'Upload Exams',
    path: '/AdminUploadExams',
    icon: <AiIcons.AiOutlineCloudUpload />,
    cName: 'nav-text',
    subItems: [
      { title: 'Listening', path: '/UploadListening' },
      { title: 'Reading', path: '/UploadReading' },
      { title: 'Writing', path: '/UploadWriting' },
      { title: 'Speaking', path: '/UploadSpeaking' },
    ],
  },
  {
    title: 'Generate Exams',
    path: '/generate-exams',
    icon: <AiIcons.AiOutlineFileText />,
    cName: 'nav-text',
  },
  {
    title: 'Messages',
    path: '/messages',
    icon: <FaIcons.FaEnvelopeOpenText />,
    cName: 'nav-text',
  },
];
