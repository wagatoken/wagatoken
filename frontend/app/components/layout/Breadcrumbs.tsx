"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MdHome, 
  MdCoffee, 
  MdFactory, 
  MdPerson, 
  MdInfo, 
  MdLibraryBooks 
} from "react-icons/md";
import { ReactElement } from "react";

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: ReactElement;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  const getBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: <MdHome size={16} /> }
    ];

    if (segments.length === 0) return breadcrumbs;

    if (segments[0] === 'browse') {
      breadcrumbs.push({ label: 'Browse Batches', href: '/browse', icon: <MdCoffee size={16} /> });
    } else if (segments[0] === 'producer') {
      breadcrumbs.push({ label: 'Producer Dashboard', href: '/producer', icon: <MdFactory size={16} /> });
    } else if (segments[0] === 'consumer') {
      breadcrumbs.push({ label: 'Consumer Portal', href: '/consumer', icon: <MdPerson size={16} /> });
    } else if (segments[0] === 'dashboard' && segments[1] === 'user') {
      // Redirect old route
      breadcrumbs.push({ label: 'Consumer Portal', href: '/consumer', icon: <MdPerson size={16} /> });
    } else if (segments[0] === 'about') {
      breadcrumbs.push({ label: 'About', href: '/about', icon: <MdInfo size={16} /> });
    } else if (segments[0] === 'docs') {
      breadcrumbs.push({ label: 'Documentation', href: '/docs', icon: <MdLibraryBooks size={16} /> });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <span className="mx-2">→</span>}
          <Link
            href={crumb.href}
            className={`flex items-center space-x-1 hover:text-purple-300 transition-colors ${
              index === breadcrumbs.length - 1 ? 'text-purple-300 font-medium' : ''
            }`}
          >
            {crumb.icon && <span className="flex items-center">{crumb.icon}</span>}
            <span>{crumb.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  );
}
