import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

// クローン操作の結果を表すスキーマ
export const cloneOutputSchema = z
  .object({
    success: z.boolean().describe("クローン操作が成功したかどうか"),
    message: z.string().describe("操作結果の詳細メッセージ"),
    repositoryFullPath: z
      .string()
      .optional()
      .describe("クローンしたリポジトリのフルパス"),
    cloneDirectoryName: z
      .string()
      .optional()
      .describe("クローン先のディレクトリ名（相対パス）"),
  })
  .describe("リポジトリクローン操作の結果");

// Githubリポジトリをクローンするツール
export const cloneRepositoryTool = createTool({
  id: "clone-repository",
  description:
    "Githubリポジトリをクローンして、コード解析やファイル処理を可能にします",
  inputSchema: z.object({
    repositoryUrl: z.string().describe("クローンするリポジトリのURL"),
    branch: z.string().describe("クローンするリポジトリのブランチ名"),
    includeLfs: z
      .boolean()
      .optional()
      .default(false)
      .describe("Git LFSファイルも取得するかどうか"),
    includeSubmodules: z
      .boolean()
      .optional()
      .default(false)
      .describe("サブモジュールも取得するかどうか"),
  }),
  outputSchema: cloneOutputSchema,
  execute: async ({ context }) => {
    const { repositoryUrl, branch, includeLfs, includeSubmodules } = context;

    try {
      // リポジトリ名を取得
      const repoName =
        repositoryUrl.split("/").pop()?.replace(".git", "") || "repo";
      const cloneDir = repoName;
      const fullPath = path.resolve(process.cwd(), cloneDir);

      // ディレクトリが既に存在するか確認
      if (fs.existsSync(fullPath)) {
        return {
          success: true,
          message: `ディレクトリ${fullPath}は既に存在するため、クローンをスキップしました`,
          repositoryFullPath: fullPath,
          cloneDirectoryName: cloneDir,
        };
      }

      // クローンコマンドを作成
      let command = `git clone ${repositoryUrl}`;
      // ブランチが指定されている場合
      if (branch) command += ` -b ${branch}`;
      // サブモジュールが必要な場合
      if (includeSubmodules) command += ` --recurse-submodules`;
      // ターゲットディレクトリを指定
      command += ` ${cloneDir}`;

      // コマンド実行
      const { stdout, stderr } = await execAsync(command);

      // LFSファイルが必要な場合
      if (includeLfs) {
        try {
          // ディレクトリを移動してLFSファイルを取得
          await execAsync(`cd ${cloneDir} && git lfs pull`);
        } catch (error: any) {
          return {
            success: false,
            message: `リポジトリのクローンは成功しましたが、LFSファイルの取得に失敗しました: ${error.message}`,
            repositoryFullPath: fullPath,
            cloneDirectoryName: cloneDir,
          };
        }
      }

      return {
        success: true,
        message: `リポジトリを ${fullPath} にクローンしました。`,
        repositoryFullPath: fullPath,
        cloneDirectoryName: cloneDir,
      };
    } catch (error: any) {
      // ダミーの値として、プロセスの作業ディレクトリと"repo"を返す
      const dummyCloneDir = "repo";
      const dummyFullPath = path.resolve(process.cwd(), dummyCloneDir);
      console.error(`クローンエラー：${error.message}`);
      console.error(
        `デバッグ情報：リポジトリURL=${repositoryUrl},ブランチ=${branch || "default"}`
      );
      return {
        success: false,
        message: `クローンに失敗しました：${error.message}`,
        repositoryFullPath: dummyFullPath,
        cloneDirectoryName: dummyCloneDir,
      };
    }
  },
});
