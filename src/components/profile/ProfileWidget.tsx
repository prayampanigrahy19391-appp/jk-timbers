'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, LogIn } from 'lucide-react';
import Link from 'next/link';
import ProfileEditorModal from './ProfileEditorModal';

export default function ProfileWidget() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-wood-100 dark:bg-timber-800 animate-pulse flex items-center justify-center border-2 border-transparent">
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <Link href="/login" className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-wood-50 dark:bg-timber-900 rounded-full text-wood-700 dark:text-wood-300 hover:text-accent hover:bg-wood-100 dark:hover:bg-timber-800 transition-colors border border-wood-200 dark:border-timber-700 shadow-sm" title="Sign In / Register">
        <LogIn size={20} />
      </Link>
    );
  }

  // Get user initials or use default icon
  const getInitials = (name?: string | null) => {
    if (!name) return <User size={20} />;
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-wood-900 text-accent rounded-full hover:bg-wood-800 hover:scale-105 transition-all shadow-md font-bold text-sm border-2 border-accent/20"
        title="View Profile"
      >
        {getInitials(session.user?.name)}
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-timber-950 rounded-full"></span>
      </button>

      <ProfileEditorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userEmail={session.user?.email || 'Unknown User'}
      />
    </>
  );
}
