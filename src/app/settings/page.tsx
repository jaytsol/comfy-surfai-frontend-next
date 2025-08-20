import { ConnectedAccounts } from '@/components/settings/ConnectedAccounts';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">설정</h1>
      <div className="space-y-8">
        <ConnectedAccounts />
        {/* Other settings sections can be added here */}
      </div>
    </div>
  );
}
  