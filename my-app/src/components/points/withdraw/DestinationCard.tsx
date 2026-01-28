"use client";

// components/withdraw/DestinationCard.tsx
type Destination = {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    holderName: string;
  };
  
  type Props = {
    destination: Destination;
  };
  
  export default function DestinationCard({ destination }: Props) {
    const { bankName, branchName, accountType, accountNumber, holderName } =
      destination;
  
    return (
      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-[#F7F7F7] rounded-2xl border border-gray-300 shadow-sm px-5 py-4">
          <div className="text-lg font-semibold mb-3 text-black">出金先</div>
          <div className="space-y-1 text-sm text-black">
            <p>
              {bankName}　{branchName}
            </p>
            <p>
              {accountType}　{accountNumber}
            </p>
            <p>{holderName}</p>
          </div>
        </div>
      </div>
    );
  }
  