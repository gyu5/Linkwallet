"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
};

const MOCK_USERS: User[] = [
  { id: 1, name: "ユーザーA" },
  { id: 2, name: "ユーザーB" },
  { id: 3, name: "ユーザーC" },
];

type Step = "selectMembers" | "groupForm";

export default function NewGroupPage() {
  const router = useRouter();

  // どの画面か（メンバー選択 or グループ作成）
  const [step, setStep] = useState<Step>("selectMembers");

  // メンバー選択用
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // グループ作成フォーム用
  const [groupName, setGroupName] = useState("9月旅行");
  const [amountPerPerson, setAmountPerPerson] = useState("30000");
  const [deadline, setDeadline] = useState("2026-08-31");

  const filteredUsers = MOCK_USERS.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleDecideMembers = () => {
    if (selectedUserIds.length === 0) return;
    setStep("groupForm");
  };

  const handleCreateGroup = () => {
    // ここで本来はバックエンドにPOSTするが、今回はモックなので遷移だけ
    router.push("/groups");
  };

  const selectedUsers = MOCK_USERS.filter((u) =>
    selectedUserIds.includes(u.id)
  );

  return (
    <div className="min-h-screen bg-[#E6FAF4] pt-4 pb-8 px-4">
      {step === "selectMembers" ? (
        <MemberSelectScreen
          search={search}
          setSearch={setSearch}
          users={filteredUsers}
          selectedUserIds={selectedUserIds}
          toggleUser={toggleUser}
          onDecide={handleDecideMembers}
        />
      ) : (
        <GroupFormScreen
          groupName={groupName}
          setGroupName={setGroupName}
          amountPerPerson={amountPerPerson}
          setAmountPerPerson={setAmountPerPerson}
          deadline={deadline}
          setDeadline={setDeadline}
          selectedUsers={selectedUsers}
          onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
}

/* ---------- メンバー選択画面 ---------- */

type MemberSelectProps = {
  search: string;
  setSearch: (v: string) => void;
  users: User[];
  selectedUserIds: number[];
  toggleUser: (id: number) => void;
  onDecide: () => void;
};

function MemberSelectScreen({
  search,
  setSearch,
  users,
  selectedUserIds,
  toggleUser,
  onDecide,
}: MemberSelectProps) {
  const canDecide = selectedUserIds.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">グループ作成メンバー選択</span>
        <button
          onClick={onDecide}
          disabled={!canDecide}
          className={`px-4 py-1 rounded-full text-sm font-semibold ${canDecide
            ? "bg-purple-200 text-purple-800"
            : "bg-gray-200 text-gray-400"
            }`}
        >
          決定
        </button>
      </div>

      <h1 className="text-lg font-semibold mb-2">ユーザーを選択</h1>

      {/* 検索ボックス */}
      <input
        type="text"
        placeholder="ユーザーを検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm outline-none"
      />

      {/* ユーザー一覧 */}
      <div className="bg-[#E6FAF4] rounded-md">
        {users.map((user) => {
          const checked = selectedUserIds.includes(user.id);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => toggleUser(user.id)}
              className="w-full flex items-center justify-between py-3 border-b border-gray-300 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                {/* 左の丸（アイコン枠） */}
                <div className="w-7 h-7 rounded-full border border-black bg-white" />
                <span className="text-sm">{user.name}</span>
              </div>

              {/* 右のチェックボックス風 */}
              <div
                className={`w-5 h-5 border rounded-sm flex items-center justify-center ${checked ? "border-emerald-600" : "border-gray-400"
                  }`}
              >
                {checked && (
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">
                    check
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- グループ作成画面 ---------- */

type GroupFormProps = {
  groupName: string;
  setGroupName: (v: string) => void;
  amountPerPerson: string;
  setAmountPerPerson: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  selectedUsers: User[];
  onCreate: () => void;
};

function GroupFormScreen({
  groupName,
  setGroupName,
  amountPerPerson,
  setAmountPerPerson,
  deadline,
  setDeadline,
  selectedUsers,
  onCreate,
}: GroupFormProps) {
  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500">グループ作成</span>
        <button
          onClick={onCreate}
          className="px-4 py-1 rounded-full text-sm font-semibold bg-purple-200 text-purple-800"
        >
          作成
        </button>
      </div>

      {/* 上部：グループアイコン + 名前 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full border border-black bg-white" />
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="bg-transparent border-b border-black text-xl font-bold outline-none flex-1"
        />
      </div>

      {/* 1人いくらか */}
      <div className="flex items-center text-xl mb-6">
        <span className="mr-2">1人</span>
        <input
          type="number"
          value={amountPerPerson}
          onChange={(e) => setAmountPerPerson(e.target.value)}
          className="border-b border-black bg-transparent text-xl font-bold outline-none w-32 text-right mr-2"
        />
        <span>円</span>
      </div>

      {/* 期限 */}
      <div className="text-xl mb-10 flex items-center gap-4">
        <span>期限</span>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-transparent border-b border-black text-lg outline-none"
        />
      </div>

      {/* メンバー丸アイコン */}
      <div className="flex gap-4">
        {selectedUsers.length === 0 ? (
          <>
            <div className="w-10 h-10 rounded-full border border-black bg-white" />
            <div className="w-10 h-10 rounded-full border border-black bg-white" />
            <div className="w-10 h-10 rounded-full border border-black bg-white" />
          </>
        ) : (
          selectedUsers.map((user) => (
            <div
              key={user.id}
              className="w-10 h-10 rounded-full border border-black bg-white flex items-center justify-center text-xs"
            >
              {user.name.at(-1)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
