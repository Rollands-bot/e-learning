import { FileText, MessageSquare, ClipboardList, Link as LinkIcon } from 'lucide-react';
import { ActivityType } from '@/types';

export default function ActivityIcon({ type, className }: { type: ActivityType; className?: string }) {
  switch (type) {
    case 'FILE':
      return <FileText className={`text-brand-600 ${className}`} />;
    case 'FORUM':
      return <MessageSquare className={`text-brand-500 ${className}`} />;
    case 'ASSIGNMENT':
      return <ClipboardList className={`text-red-500 ${className}`} />;
    case 'LINK':
      return <LinkIcon className={`text-gray-500 ${className}`} />;
    default:
      return null;
  }
}
