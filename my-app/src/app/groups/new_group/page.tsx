"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type User = {
  id: number;
  name: string;
  avatarUrl?: string | null;
};


type Step = "selectMembers" | "groupForm";

export default function NewGroupPage() {
  const router = useRouter();

  // どの画面か（メンバー選択 or グループ作成）
  const [step, setStep] = useState<Step>("selectMembers");

  // メンバー選択用
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const supabase = createSupabaseBrowserClient();

        // ログインユーザー取得
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          console.error(userError);
          setFetchError("ユーザー情報の取得に失敗しました");
          return;
        }

        // フレンドID一覧取得
        const {
          data: friendRelations,
          error: friendsError,
        } = await supabase
          .from("user_friends")
          .select("friend_id")
          .eq("user_id", userData.user.id);

        if (friendsError) {
          console.error(friendsError);
          setFetchError("フレンド一覧の取得に失敗しました");
          return;
        }

        if (!friendRelations || friendRelations.length === 0) {
          setFriends([]);
          return;
        }

        const friendIds = friendRelations.map((f) => f.friend_id);

        // 実際のユーザー情報をまとめて取得
        const {
          data: friendUsers,
          error: friendUsersError,
        } = await supabase
          .from("users")
          .select("id, display_name, avatar_url")
          .in("id", friendIds);

        if (friendUsersError) {
          console.error(friendUsersError);
          setFetchError("フレンド情報の取得に失敗しました");
          return;
        }

        const mappedFriends: User[] =
          friendUsers?.map((u) => ({
            id: u.id,
            name: u.display_name as string,
            avatarUrl: (u as any).avatar_url ?? null,
          })) ?? [];

        setFriends(mappedFriends);
      } catch (e) {
        console.error(e);
        setFetchError("フレンド情報の取得中にエラーが発生しました");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // グループ作成フォーム用
  const [groupName, setGroupName] = useState("グループ名");
  const [amountPerPerson, setAmountPerPerson] = useState("0");
  const [deadline, setDeadline] = useState("2026-01-01");

  const filteredUsers = friends.filter((user) =>
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

  const selectedUsers = friends.filter((u) =>
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
        <span className="text-sm text-black">グループ作成メンバー選択</span>
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

      <h1 className="text-lg font-semibold mb-2 text-black">ユーザーを選択</h1>

      {/* 検索ボックス */}
      <input
        type="text"
        placeholder="ユーザーを検索"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-md border border-gray-500 bg-white text-sm text-black outline-none"
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
              className="w-full flex items-center justify-between py-3 border-b border-gray-500 last:border-b-0 text-black"
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
  const [groupIcon, setGroupIcon] = useState<string | null>(null);
  const [groupIconFile, setGroupIconFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGroupIconFile(file);
    const url = URL.createObjectURL(file);
    setGroupIcon(url);
  };

  const handleCreateClick = async () => {
    if (saving) return;

    try {
      setSaving(true);

      // 1. ログインユーザー取得
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        alert("ユーザー情報の取得に失敗しました");
        return;
      }

      // 2. グループアイコンを Storage にアップロード（あれば）
      let photoUrl: string | null = null;

      if (groupIconFile) {
        const fileExt = groupIconFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}_group.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user_pf")
          .upload(filePath, groupIconFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error(uploadError);
          alert("グループアイコンのアップロードに失敗しました");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("user_pf").getPublicUrl(filePath);
        photoUrl = publicUrl;
      }

      // 3. groups テーブルにグループを作成
      const goalAmount = Number(amountPerPerson || "0");

      const {
        data: groupData,
        error: groupError,
      } = await supabase
        .from("groups")
        .insert({
          display_name: groupName,
          photo_url: photoUrl,
          dead_line: deadline,
          goal_amount: goalAmount,
        })
        .select("id")
        .single();

      if (groupError || !groupData) {
        console.error(groupError);
        alert("グループの作成に失敗しました");
        return;
      }

      const groupId = groupData.id;

      // 4. user_groups テーブルに参加ユーザーを登録
      const memberIds = Array.from(
        new Set([...selectedUsers.map((u) => u.id), user.id])
      );

      const rows = memberIds.map((id) => ({
        user_id: id,
        group_id: groupId,
        saving_amount: 0,
      }));

      const { error: userGroupsError } = await supabase
        .from("user_groups")
        .insert(rows);

      if (userGroupsError) {
        console.error(userGroupsError);
        alert("グループメンバーの登録に失敗しました");
        return;
      }

      // 5. 正常終了時は上位のハンドラを呼んで画面遷移などを任せる
      onCreate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500">グループ作成</span>
        <button
          onClick={handleCreateClick}
          disabled={saving}
          className={`px-4 py-1 rounded-full text-sm font-semibold ${
            saving
              ? "bg-purple-100 text-purple-400 cursor-not-allowed"
              : "bg-purple-200 text-purple-800"
          }`}
        >
          {saving ? "作成中..." : "作成"}
        </button>
      </div>

      {/* 上部：グループアイコン + 名前 */}
      <div className="flex items-center gap-4 mb-8">
        <label className="w-12 h-12 rounded-full border border-gray-500 bg-white overflow-hidden flex items-center justify-center cursor-pointer">
          {groupIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={groupIcon}
              alt="グループアイコン"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs text-gray-500">アイコン</span>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleIconChange}
          />
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="bg-transparent border-b text-gray-500 text-xl font-bold outline-none flex-1 text-black"
        />
      </div>

      {/* 1人いくらか */}
      <div className="flex items-center text-xl mb-6">
        <span className="mr-2 text-gray-700">1人</span>
        <input
          type="number"
          value={amountPerPerson}
          onChange={(e) => setAmountPerPerson(e.target.value)}
          className="border-b border-black bg-transparent text-gray-500 text-xl font-bold outline-none w-32 text-right mr-2"
        />
        <span className="text-gray-700">円</span>
      </div>

      {/* 期限 */}
      <div className="text-xl mb-10 flex items-center gap-4">
        <span className="text-gray-700">期限</span>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-transparent border-b text-gray-700 text-lg outline-none text-black"
        />
      </div>

      {/* メンバー丸アイコン + 表示名 */}
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
              className="flex flex-col items-center gap-1 w-16"
            >
              <div className="w-10 h-10 rounded-full border border-black bg-white overflow-hidden flex items-center justify-center">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-black">
                    {user.name.at(0)}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-black text-center truncate w-full">
                {user.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
