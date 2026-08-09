'use client';

import React from 'react';
import { ComplaintItem } from '@/lib/types';
import { ReportFlowSection } from './ReportFlowSection';
import { SupportedLanguage } from '@/lib/copy-helpers';

interface SubmitComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (newComplaint: ComplaintItem, supportedMasterTicketId?: string) => void;
  existingComplaints: ComplaintItem[];
  lang?: SupportedLanguage;
}

export const SubmitComplaintModal: React.FC<SubmitComplaintModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  existingComplaints,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-2xl">
        <ReportFlowSection
          onSuccess={(complaint, dupId) => {
            onSubmitSuccess(complaint, dupId);
          }}
          onViewMyReport={onClose}
          existingComplaints={existingComplaints}
          lang={lang}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
