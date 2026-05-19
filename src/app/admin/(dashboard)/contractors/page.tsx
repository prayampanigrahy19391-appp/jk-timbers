import { listContractorApplications } from '@/services/contractorService';
import { Building2, Mail, Phone } from 'lucide-react';
import ReviewContractorButtons from './ReviewContractorButtons';

export const dynamic = 'force-dynamic';

export default async function AdminContractorsPage() {
  const applications = await listContractorApplications();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-wood-950 dark:text-white">Contractor Applications</h1>
        <p className="text-timber-500">Review business clients, approve account roles, and prepare contractor pricing.</p>
      </div>

      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="rounded-lg border border-wood-100 bg-white p-12 text-center text-timber-500 dark:border-timber-800 dark:bg-timber-900">
            <Building2 size={48} className="mx-auto mb-4 text-timber-300" />
            <p>No contractor applications are waiting for review.</p>
          </div>
        ) : (
          applications.map((application) => (
            <div key={application.id} className="rounded-lg border border-wood-100 bg-white p-6 shadow-sm dark:border-timber-800 dark:bg-timber-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-wood-950 dark:text-white">
                      {application.firstName} {application.lastName ?? ''}
                    </h2>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      application.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : application.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="text-sm text-timber-600 dark:text-timber-300">
                    {[application.company, application.businessType, application.city].filter(Boolean).join(' • ') || 'Independent contractor'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-timber-600 dark:text-timber-300">
                    <span className="inline-flex items-center gap-2"><Mail size={16} className="text-accent" /> {application.email}</span>
                    {application.phone && <span className="inline-flex items-center gap-2"><Phone size={16} className="text-accent" /> {application.phone}</span>}
                    {application.gstNumber && <span className="font-mono">GST: {application.gstNumber}</span>}
                  </div>
                </div>

                {application.status === 'PENDING' ? (
                  <ReviewContractorButtons applicationId={application.id} />
                ) : (
                  <div className="text-sm text-timber-500">
                    {application.discountRate ? `${application.discountRate.toNumber()}% contractor discount` : 'No discount configured'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
