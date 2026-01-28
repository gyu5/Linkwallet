// components/withdraw/WithdrawScreen.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DestinationCard from "./DestinationCard";
import ResultDialog from "./ResultDialog";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Destination = {
  bankName: string;
  branchName: string;
  accountType: string;
  accountNumber: string;
  holderName: string;
};

type ResultStatus = "success" | "error" | null;

type Props = {
  points: number;
  destination: Destination;
  groupId: string;
};


export default function WithdrawScreen({ points, destination, groupId }: Props) {
  const [notifyChecked, setNotifyChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultStatus>(null);
  const router = useRouter();
  const yen = points; // 1ポイント=1円の想定。違うレートなら計算を書き換え
  const supabase = createSupabaseBrowserClient();

  const format = (n: number) => n.toLocaleString("ja-JP");

  const handleWithdraw = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 本来はここで API を叩く
      // ここでは Supabase を直接叩いて user_groups.saving_amount を 0 に更新する

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        setResult("error");
        return;
      }

      const { error: updateError } = await supabase
        .from("user_groups")
        .update({ saving_amount: 0 })
        .eq("user_id", user.id)
        .eq("group_id", groupId);

      if (updateError) {
        console.error(updateError);
        setResult("error");
        return;
      }

      // 出金に成功したら、グループ内の他メンバーに通知を送る
      try {
        // グループ名とユーザー名を取得
        const [{ data: group }, { data: profile }, { data: members }] =
          await Promise.all([
            supabase
              .from("groups")
              .select("display_name")
              .eq("id", groupId)
              .maybeSingle(),
            supabase
              .from("users")
              .select("display_name")
              .eq("id", user.id)
              .maybeSingle(),
            supabase
              .from("user_groups")
              .select("user_id")
              .eq("group_id", groupId),
          ]);

        const groupName = (group as any)?.display_name ?? "このグループ";
        const userName = (profile as any)?.display_name ?? "だれか";

        const notificationMessage = `${groupName}の${userName}が出金しました`;

        const notificationRows =
          members
            ?.filter((m: any) => m.user_id !== user.id)
            .map((m: any) => ({
              user_id: m.user_id,
              message: notificationMessage,
            })) ?? [];

        if (notificationRows.length > 0) {
          const { error: notificationsError } = await supabase
            .from("notifications")
            .insert(notificationRows);

          if (notificationsError) {
            console.error(notificationsError);
          }
        }
      } catch (e) {
        console.error("failed to send withdraw notifications", e);
      }

      // 成功とみなす
      setResult("success");
    } catch (e) {
      setResult("error");
    } finally {
      setLoading(false);
    }

    // notifyChecked の値はサーバー側で通知フラグとして使うイメージ
    console.log("notify other members:", notifyChecked);
  };

  return (
    <div className="min-h-screen bg-[#E6FAF4] pt-10 pb-24">
      {/* 残高表示 */}
      <div className="text-center mb-8 text-black">
        <p className="text-3xl font-extrabold tracking-wide">
          {format(points)} <span className="text-xl font-semibold">ポイント</span>
        </p>
        <p className="text-sm text-gray-700 mt-1">{format(yen)} 円</p>
      </div>

      {/* 出金先カード */}
      <div className="mb-8">
        <DestinationCard destination={destination} />
      </div>

      {/* チェックボックス */}
      <div className="w-full max-w-md mx-auto px-6 mb-10">
        <label className="flex items-start gap-2 text-sm cursor-pointer text-black">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 border border-gray-700 rounded-sm"
            checked={notifyChecked}
            onChange={(e) => setNotifyChecked(e.target.checked)}
          />
          <span>
            出金したことは他のメンバーに
            <br />
            知らされます。
          </span>
        </label>
      </div>

      {/* 出金ボタン */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleWithdraw}
          disabled={loading || !notifyChecked}
          className={`
            px-12 py-3 rounded-full text-sm font-medium shadow
            ${
                !notifyChecked
                  ? "bg-gray-300 text-gray-500 border-gray-300 opacity-60 cursor-not-allowed"
                  : "bg-pink-50 text-pink-500 border-pink-200 active:scale-95"
              }
            ${loading ? "opacity-60 cursor-not-allowed" : "active:scale-95"}
          `}
        >
          {loading ? "処理中..." : "出金"}
        </button>
      </div>

      {/* ポップアップ（成功 / 失敗） */}
      <ResultDialog status={result} onClose={() => 
          {
            if (result === "success") {
              router.replace("/home");   // ← 出金成功時はホームへ遷移
            }
            setResult(null);
          }
        } />
    </div>
  );
}
